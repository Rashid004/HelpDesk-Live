import { createServer } from "http";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { initSocket } from "./realtime/io.js";

await connectDB();

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
      healthCheck: `http://localhost:${env.PORT}/health`,
    },
    "Server started successfully",
  );
});
