import type { MessageView } from "../lib/types";
import { currentUser } from "./users";

const minsAgo = (n: number): Date => new Date(Date.now() - n * 60_000);

function customerMsg(
  id: string,
  ticket: string,
  content: string,
  createdAt: Date,
  readAt: Date | null,
): MessageView {
  return {
    id,
    ticket,
    sender: currentUser.id,
    senderName: currentUser.fullName,
    senderRole: "customer",
    mine: true,
    content,
    readAt,
    createdAt,
  };
}

function agentMsg(
  id: string,
  ticket: string,
  senderId: string,
  senderName: string,
  content: string,
  createdAt: Date,
): MessageView {
  return {
    id,
    ticket,
    sender: senderId,
    senderName,
    senderRole: "agent",
    mine: false,
    content,
    readAt: createdAt,
    createdAt,
  };
}

/** Chat threads keyed by ticket id. Tickets with no entry start empty. */
export const mockMessages: Record<string, MessageView[]> = {
  tkt_02: [
    customerMsg(
      "msg_0201",
      "tkt_02",
      "Hi — the Export CSV button on Reports just spins forever and nothing downloads.",
      minsAgo(190),
      minsAgo(185),
    ),
    agentMsg(
      "msg_0202",
      "tkt_02",
      "usr_agent_01",
      "Devon Pryce",
      "Thanks for the report, Maya. I can reproduce it on large date ranges. Can you tell me roughly how many rows your report covers?",
      minsAgo(180),
    ),
    customerMsg(
      "msg_0203",
      "tkt_02",
      "Probably around 40,000 rows — it's the full year.",
      minsAgo(172),
      minsAgo(170),
    ),
    agentMsg(
      "msg_0204",
      "tkt_02",
      "usr_agent_01",
      "Devon Pryce",
      "That lines up. The export is timing out server-side before the file is built. Our team is deploying a streaming export today — I'll update this ticket the moment it's live.",
      minsAgo(165),
    ),
    customerMsg(
      "msg_0205",
      "tkt_02",
      "Great, appreciate the quick look. I'll wait for your update.",
      minsAgo(160),
      null,
    ),
  ],
  tkt_03: [
    customerMsg(
      "msg_0301",
      "tkt_03",
      "Every time I try to change my account email I get 'something went wrong'.",
      minsAgo(60 * 96),
      minsAgo(60 * 95),
    ),
    agentMsg(
      "msg_0302",
      "tkt_03",
      "usr_agent_02",
      "Aisha Khan",
      "Found it — there was a stale verification token on your account blocking the update. I've cleared it. Please try again and let me know.",
      minsAgo(60 * 94),
    ),
    customerMsg(
      "msg_0303",
      "tkt_03",
      "Just tried — it saved and I got the confirmation email. Thank you!",
      minsAgo(60 * 93),
      minsAgo(60 * 93),
    ),
    agentMsg(
      "msg_0304",
      "tkt_03",
      "usr_agent_02",
      "Aisha Khan",
      "Perfect. Marking this resolved — reopen any time if it comes back.",
      minsAgo(60 * 92),
    ),
  ],
};
