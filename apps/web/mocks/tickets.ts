import type { TicketView } from "../lib/types";
import { currentUser } from "./users";

const daysAgo = (n: number): Date => new Date(Date.now() - n * 86_400_000);

/**
 * Sample tickets for the signed-in customer — deliberately spans every
 * status / priority / category so all badge colors are visible.
 */
export const mockTickets: TicketView[] = [
  {
    id: "tkt_01",
    referenceNumber: "HD-4821",
    title: "Refund for duplicate subscription charge",
    description:
      "I was billed twice for my annual plan on the 3rd — order #A-99312 and #A-99313. Please refund the duplicate.",
    category: "billing",
    priority: "high",
    customer: currentUser.id,
    customerName: currentUser.fullName,
    agent: null,
    agentName: null,
    status: "open",
    statusUpdates: [],
    attachments: [
      {
        fileUrl: "https://cdn.helpdesk.live/mock/duplicate-charge.png",
        fileType: "image",
        uploadedAt: daysAgo(1),
      },
    ],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "tkt_02",
    referenceNumber: "HD-4790",
    title: "Export button does nothing on the Reports page",
    description:
      "Clicking 'Export CSV' on Reports just spins and never downloads. Tried Chrome and Firefox, same result.",
    category: "technical",
    priority: "normal",
    customer: currentUser.id,
    customerName: currentUser.fullName,
    agent: "usr_agent_01",
    agentName: "Devon Pryce",
    status: "inProgress",
    statusUpdates: [
      { status: "inProgress", changedBy: "usr_agent_01", changedAt: daysAgo(2) },
    ],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  },
  {
    id: "tkt_03",
    referenceNumber: "HD-4655",
    title: "Can't update the email address on my account",
    description:
      "Settings › Account › Email shows 'something went wrong' every time I save a new address.",
    category: "accountIssue",
    priority: "normal",
    customer: currentUser.id,
    customerName: currentUser.fullName,
    agent: "usr_agent_02",
    agentName: "Aisha Khan",
    status: "resolved",
    resolutionNote:
      "A stale verification token was blocking the change. Cleared it on our side — you can update the email now and the confirmation mail will arrive within a minute.",
    statusUpdates: [
      { status: "inProgress", changedBy: "usr_agent_02", changedAt: daysAgo(5) },
      {
        status: "resolved",
        changedBy: "usr_agent_02",
        note: "Cleared stale token",
        changedAt: daysAgo(4),
      },
    ],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(4),
  },
  {
    id: "tkt_04",
    referenceNumber: "HD-4512",
    title: "Dark mode resets to light after every reload",
    description:
      "The theme toggle works but the preference isn't remembered between sessions.",
    category: "technical",
    priority: "low",
    customer: currentUser.id,
    customerName: currentUser.fullName,
    agent: "usr_agent_01",
    agentName: "Devon Pryce",
    status: "resolved",
    resolutionNote:
      "Shipped a fix in release 3.8.2 — the theme is now stored per account instead of per device. Please hard-refresh once.",
    customerRating: {
      score: 5,
      comment: "Fast turnaround, thanks!",
      ratedAt: daysAgo(8),
    },
    statusUpdates: [
      { status: "resolved", changedBy: "usr_agent_01", changedAt: daysAgo(9) },
    ],
    createdAt: daysAgo(12),
    updatedAt: daysAgo(8),
  },
  {
    id: "tkt_05",
    referenceNumber: "HD-4390",
    title: "Question about invoice VAT breakdown",
    description:
      "My accountant needs the VAT shown as a separate line on the PDF invoice. Is that possible?",
    category: "billing",
    priority: "low",
    customer: currentUser.id,
    customerName: currentUser.fullName,
    agent: "usr_agent_02",
    agentName: "Aisha Khan",
    status: "closed",
    resolutionNote:
      "Enabled itemised VAT on your billing profile and re-issued the last invoice. Closing this out — reopen any time if the accountant needs more.",
    customerRating: { score: 4, ratedAt: daysAgo(18) },
    statusUpdates: [
      { status: "resolved", changedBy: "usr_agent_02", changedAt: daysAgo(20) },
      { status: "closed", changedBy: "usr_agent_02", changedAt: daysAgo(18) },
    ],
    createdAt: daysAgo(25),
    updatedAt: daysAgo(18),
  },
];
