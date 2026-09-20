// Apply migrations at build time, on a database that may be asleep.
//
// WHY THIS EXISTS. `prisma migrate deploy` takes a Postgres advisory lock so
// two concurrent deploys cannot apply the same migration, and it gives that
// lock ten seconds. Neon scales a compute to zero when it is idle, and waking
// one takes longer than that, so a deploy after a quiet period failed with
// P1002 — "timed out trying to acquire a postgres advisory lock" — while a
// deploy minutes after someone had touched the database succeeded.
//
// Intermittent, and it broke production deploys twice: the site kept serving
// the previous commit while the build went red.
//
// Switching the migration connection from the pooler to the direct endpoint
// was necessary but not sufficient. A transaction pooler is genuinely the
// wrong place to hold a session-level lock, and that is fixed; the cold start
// is a separate problem underneath it.
//
// WHAT IT DOES. Opens a plain connection and waits for the compute to wake
// before Prisma is ever started, then runs migrate deploy, retrying only the
// lock timeout. Everything else fails immediately: a genuinely broken
// migration must stop the build, because shipping code that reads a column
// which does not exist is worse than not shipping.
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
    console.error("migrate: failed, and the build should not continue.");
    process.exit(r.status ?? 1);
  }

  console.log(`migrate: advisory lock timed out, retrying (${attempt} of 3)…`);
  await sleep(5000);
}
