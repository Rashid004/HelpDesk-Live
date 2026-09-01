import { Worker, type Job } from "bullmq";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { sendEmail } from "../../lib/email.js";
import { renderResolutionEmail } from "../../lib/emailTemplates/resolutionEmail.js";
import { queueConnection } from "./connection.js";
import {
    EMAIL_QUEUE_NAME,
    RESOLUTION_EMAIL_JOB,
    type ResolutionEmailJobData,
} from "./email.queue.js";

// It s
async function processResolutionEmail(job: Job<ResolutionEmailJobData>): Promise<void> {
    const { ticketId, customerEmail, referenceNumber } = job.data;

    logger.info(
        { jobId: job.id, attempt: job.attemptsMade + 1, ticketId },
        "processing resolution email job",
    );

    const { subject, html, text } = renderResolutionEmail({
        referenceNumber,
        ticketUrl: `${env.FRONTEND_URL}/tickets/${ticketId}`,
    });

    await sendEmail({ to: customerEmail, subject, html, text });
}

let worker: Worker<ResolutionEmailJobData> | undefined;


export function startEmailWorker(): Worker<ResolutionEmailJobData> | undefined {
    if (!queueConnection) {
        logger.warn("email worker not started (no REDIS_URL)");
        return undefined;
    }
    if (worker) return worker;

    worker = new Worker<ResolutionEmailJobData>(
        EMAIL_QUEUE_NAME,
        async (job) => {
            if (job.name === RESOLUTION_EMAIL_JOB) {
                await processResolutionEmail(job);
            }
        },
        { connection: queueConnection, concurrency: 5 },
    );

    worker.on("completed", (job) => {
        logger.info(
            { jobId: job.id, ticketId: job.data.ticketId, attempts: job.attemptsMade + 1 },
            "email job SUCCEEDED",
        );
    });

    worker.on("failed", (job, err) => {
        if (!job) {
            logger.error({ err: err.message }, "email job failed (no job reference)");
            return;
        }

        const maxAttempts = job.opts.attempts ?? 1;

        if (job.attemptsMade >= maxAttempts) {
            logger.error(
                { jobId: job.id, ticketId: job.data.ticketId, attemptsMade: job.attemptsMade, err: err.message },
                "email job PERMANENTLY FAILED after exhausting retries — email not sent",
            );
            return;
        }

        const base =
            typeof job.opts.backoff === "object" ? (job.opts.backoff.delay ?? 2000) : 2000;
        const retryInMs = base * 2 ** (job.attemptsMade - 1);

        logger.warn(
            { jobId: job.id, ticketId: job.data.ticketId, attemptsMade: job.attemptsMade, retryInMs, err: err.message },
            "email job failed — will RETRY with backoff",
        );
    });

    worker.on("error", (err) => logger.error({ err: err.message }, "email worker error"));

    logger.info("email worker started");
    return worker;
}
