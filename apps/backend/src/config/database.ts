import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";
import { createModuleLogger } from "./logger.js";

const logger = createModuleLogger("mongo");

// Some local networks (VPNs, proxies) point Node's DNS resolver at a
// nameserver that doesn't answer SRV queries, breaking mongodb+srv://
// lookups even though the OS resolver works fine. Fall back to public
// resolvers so SRV lookups succeed regardless of local DNS config.
dns.setServers([...dns.getServers(), "8.8.8.8", "1.1.1.1"]);

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info(
      { environment: env.NODE_ENV },
      "MongoDB connected successfully",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ message }, "MongoDB connection failed");
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  logger.info("MongoDB connection closed through app termination");
  process.exit(0);
});
