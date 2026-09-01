import { logger } from "../../config/logger.js";
import { queueConnection } from "./connection.js";
import { Queue } from 'bullmq'


export const EMAIL_QUEUE_NAME = "email-queue";
export const RESOLUTION_EMAIL_JOB = "resolution-email";


export interface ResolutionEmailJobData {
    ticketId: string;
    customerEmail: string;
    referenceNumber: string;
}

export const emailQueue = queueConnection ? new Queue<ResolutionEmailJobData>(EMAIL_QUEUE_NAME, {
    connection: queueConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: false,
    }
}) : null;

export async function enqueueResolutionEmail(
    ticketId: string,
    customerEmail: string,
    referenceNumber: string): Promise<void> {

    if (!emailQueue) {
        logger.warn({ ticketId }, "email queue disabled (no REDIS_URL) — resolution email skipped");
        return;
    }

    // emailQueue is non-null here — guarded above.
    const job = await emailQueue.add(RESOLUTION_EMAIL_JOB, {
        ticketId,
        customerEmail,
        referenceNumber,
    });
    logger.info({ jobId: job.id, ticketId, referenceNumber }, "resolution email job enqueued");
}