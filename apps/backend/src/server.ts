import app from "./app.js";
import { connectDB } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { startEmailWorker } from "./infrastructure/queue/email.worker.js";
import { initSocket } from "./realtime/io.js";
import http from "http";



await connectDB();
startEmailWorker();


const httpServer = http.createServer(app)
initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
      healthCheck: `http://localhost:${env.PORT}/health`,
      socket: `ws://localhost:${env.PORT}`,
    },
    "Server started successfully",
  );
});