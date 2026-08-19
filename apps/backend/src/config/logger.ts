import pino from "pino";
import { pinoHttp } from "pino-http";
import { env } from "./env.js";

const isDevelopment = env.NODE_ENV === "development";

const createLogger = () => {
  return pino({
    level: env.LOG_LEVEL,

    // Use pino-pretty in development for readable logs
    ...(isDevelopment && {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          messageFormat: "{msg}",
          errorLikeObjectKeys: ["err", "error"],
        },
      },
    }),

    // Production configuration
    ...(!isDevelopment && {
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          "password",
          "token",
          "secret",
          "*.password",
          "*.token",
          "*.secret",
        ],
        remove: true,
      },
    }),

    // Base fields for all logs
    base: {
      env: env.NODE_ENV,
      service: "helpdesk-live-backend",
    },
  });
};

export const logger = createLogger();

// Create child loggers for specific modules
export const createModuleLogger = (module: string) => {
  return logger.child({ module });
};

/**
 * pino-http middleware — replaces manual request logging in app.ts.
 * Logs every HTTP request/response with method, url, status, response time,
 * and the request ID from req.requestId (set by requestIdMiddleware).
 */
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => (req as any).requestId,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  autoLogging: {
    ignore: (req) => req.url === "/health",
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      requestId: req.id,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
