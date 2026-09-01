import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export interface SendEmailInput {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<void> {
    if (!resend) {
        logger.info({ to, subject }, "[email:mock] RESEND_API_KEY unset — pretending to send");
        return;
    }

    const { data, error } = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject,
        html,
        text: text ?? "",
    })

    if (error) {
        throw new Error(`Resend send failed: ${error.message}`);
    }
    logger.info({ to, subject, providerId: data?.id }, "[email] sent via Resend");

}