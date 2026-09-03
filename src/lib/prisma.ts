import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

// Determine the db path based on environment or default to dev.db
// Next.js App Router might run this from project root
const dbUrl = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';

// Ensure the singleton instance across hot reloads in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  const sqlite = new Database(dbUrl);
  const adapter = new PrismaBetterSqlite3(sqlite);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const sqlite = new Database(dbUrl);
    const adapter = new PrismaBetterSqlite3(sqlite);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
