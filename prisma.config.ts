import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations prefer a direct connection.
//
// DATABASE_URL points at Neon's pooler, which is PgBouncer in transaction mode.
// The application wants that: it is what lets a lot of short serverless
// requests share a small number of backends. Migrations want the opposite.
// `migrate deploy` takes a session-level advisory lock so two deploys cannot
// apply the same migration at once, and a transaction pooler is the wrong
// place to hold one — under connection pressure the lock attempt times out
// with P1002 and the deploy fails.
//
// So DIRECT_URL is used when it is set, and DATABASE_URL otherwise. The
// fallback matters: nothing breaks if the variable is absent, it just goes
// back to using the pooler, which works fine when nothing else is competing
// for connections.
//
// To set it: Neon's connection string without the "-pooler" in the host.
const migrationUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: migrationUrl! },
});
