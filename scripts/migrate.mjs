// Apply migrations. Run deliberately: `npm run migrate`.
//
// NOT WIRED INTO THE BUILD, and that is the point of this comment.
//
// It was, briefly. `prisma migrate deploy` takes a session-level Postgres
// advisory lock so two deploys cannot apply the same migration at once, and
// allows ten seconds for it. On Vercel that timed out with P1002 and took the
// whole build down with it, three times, leaving the site on an older commit
// while the build went red.
//
// Two of those failures had explanations that turned out to be incomplete:
// migrations were going through Neon's pooler, which is a transaction pooler
// and genuinely the wrong place to hold a session lock (fixed — DIRECT_URL is
// set and used); and the compute might have been asleep (it was not — the wake
// step below reported the database awake in about a second, and the lock still
// timed out). From a laptop, against the same database, the same lock can be
// taken in under a second.
//
// So the cause of the Vercel-side failure is not established, and blocking
// every deploy on an unexplained intermittent failure is a bad trade for a
// convenience. Migrations are applied by running this, and `prisma migrate
// status` will say if a deploy is ahead of the database.
//
// WHAT IT DOES. Waits for the compute to wake before Prisma starts, then runs
// migrate deploy, retrying only the lock timeout. Any other failure exits
// non-zero immediately.
// Loaded the same way prisma.config.ts loads it, so `npm run build` works on a
// laptop where the variables live in .env. On Vercel they are already in the
// environment and this is a no-op.
import "dotenv/config";
import { spawnSync } from "node:child_process";
import pg from "pg";

const URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!URL) {
  console.error("migrate: neither DIRECT_URL nor DATABASE_URL is set.");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Wake the compute. Neon answers slowly rather than refusing while it boots. */
async function wake() {
  const deadline = Date.now() + 90_000;
  let attempt = 0;
  for (;;) {
    attempt++;
    const client = new pg.Client({ connectionString: URL, connectionTimeoutMillis: 20_000 });
    try {
      await client.connect();
      await client.query("select 1");
      await client.end();
      console.log(`migrate: database is awake (attempt ${attempt}).`);
      return;
    } catch (err) {
      await client.end().catch(() => {});
      if (Date.now() > deadline) {
        console.error(`migrate: database never answered after ${attempt} attempts.`);
        throw err;
      }
      console.log(`migrate: waiting for the database (attempt ${attempt}): ${err.message}`);
      await sleep(3000);
    }
  }
}

function runMigrate() {
  return spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    env: process.env,
  });
}

await wake();

for (let attempt = 1; attempt <= 3; attempt++) {
  const r = runMigrate();
  process.stdout.write(r.stdout ?? "");
  process.stderr.write(r.stderr ?? "");

  if (r.status === 0) process.exit(0);

  // Only the lock timeout is worth another go. Anything else is a real
  // failure and retrying it just delays the same red build.
  const output = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const lockTimeout = output.includes("P1002") && output.includes("advisory lock");
  if (!lockTimeout || attempt === 3) {
    console.error("migrate: failed. The database was not changed by this run.");
    process.exit(r.status ?? 1);
  }

  console.log(`migrate: advisory lock timed out, retrying (${attempt} of 3)…`);
  await sleep(5000);
}
