import type { Ticket } from "@repo/shared";
import { messaging } from "../../lib/firebase.js";
import { logger } from "../../config/logger.js";
import { userRepository } from "../users/user.repository.js";

/**
 * Push agents with a saved FCM token when a new ticket comes in. Called
 * fire-and-forget from ticket.service.ts — see the comment there for why
 * this must never throw into the request path.
 */
export async function notifyAgentsOfNewTicket(ticket: Ticket): Promise<void> {
  if (!messaging) {
    logger.warn("FCM not configured — skipping new-ticket push");
    return;
  }

  const agents = await userRepository.findAgentsWithFcmToken();
  const tokens = agents.map((agent) => agent.fcmToken).filter((token): token is string => !!token);
  if (tokens.length === 0) return;

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: "New ticket",
      body: `${ticket.referenceNumber} — ${ticket.title}`,
    },
    // Delivered to the service worker's onBackgroundMessage / the page's
    // onMessage handler so the frontend can route a click to the ticket.
    data: {
      type: "ticket:new",
      ticketId: ticket.id,
    },
  });

  response.responses.forEach((result, i) => {
    if (!result.success) {
      logger.warn(
        { token: tokens[i], error: result.error?.message },
        "FCM push failed for one agent token",
      );
    }
  });

  logger.info(
    { ticketId: ticket.id, sent: response.successCount, failed: response.failureCount },
    "new-ticket push notification sent",
  );
}

/**
 * Push the customer when their ticket is resolved. Called fire-and-forget
 * from ticket.service.ts's updateStatus — same reasoning as
 * notifyAgentsOfNewTicket: an agent resolving a ticket must get their
 * response immediately regardless of FCM.
 *
 * Takes the token directly instead of looking the customer up again —
 * ticket.service.ts already fetched the customer doc to send the
 * resolution email, so this reuses that instead of a second DB round trip.
 */
export async function notifyCustomerOfResolution(
  ticket: Ticket,
  customerFcmToken: string | null | undefined,
): Promise<void> {
  if (!messaging) {
    logger.warn("FCM not configured — skipping resolution push");
    return;
  }
  if (!customerFcmToken) return;

  await messaging.send({
    token: customerFcmToken,
    notification: {
      title: "Ticket resolved",
      body: `${ticket.referenceNumber} — ${ticket.title} has been resolved.`,
    },
    data: {
      type: "ticket:resolved",
      ticketId: ticket.id,
    },
  });

  logger.info({ ticketId: ticket.id }, "resolution push notification sent to customer");
}
