import { PrismaClient } from "../../generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";
import { createModuleLogger } from "./logger.js";

const logger = createModuleLogger("prisma");

// One adapter -> one connection pool, reused for the lifetime of the process.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info({ environment: env.NODE_ENV }, "PostgreSQL connected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ message }, "PostgreSQL connection failed");
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  logger.info("PostgreSQL connection closed through app termination");
  process.exit(0);
});
