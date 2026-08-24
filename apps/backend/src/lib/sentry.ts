import * as Sentry from "@sentry/node";
import { env } from "../config/env.js";

export const initSentry = () => {
    if (!env.SENTRY_DSN) return;

    Sentry.init({
        dsn: env.SENTRY_DSN,
        environment: env.NODE_ENV,
        tracesSampleRate: env.NODE_ENV === "production" ? 0.2 : 1.0,
    });
};

export { Sentry };
