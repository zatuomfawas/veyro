// One Prisma client, reused. Next.js hot-reloads modules in development, and
// creating a new client each time exhausts the database connection pool within
// a few minutes of editing files.
//
// Two things are Prisma 7 specific:
//   1. PrismaClient is imported from the generated folder, not "@prisma/client".
//      The path matches the `output` set in prisma/schema.prisma.
//   2. Prisma 7 requires a driver adapter. PrismaPg is the Postgres one.
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const g = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const db = g.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") g.prisma = db;
