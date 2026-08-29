import type {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@repo/shared";

/**
 * Mock ticket data. Objects match @repo/shared's `ticketSchema` shape
 * (ids for customer/agent, not embedded docs) so swapping in real API
 * responses later is a drop-in change.
 * TODO: replace with real GET /api/tickets.
 */

type Row = [
  ref: string,
  title: string,
  description: string,
  category: TicketCategory,
  priority: TicketPriority,
  status: TicketStatus,
  customerId: string,
  agentId: string | null,
  daysAgo: number,
  resolutionNote?: string,
];

// prettier-ignore
const ROWS: Row[] = [
  ["HD-1001", "Charged twice for the annual plan", "My card was billed $180 twice on the same day for the yearly subscription. I only upgraded once.", "billing", "high", "open", "cus_01", null, 0],
  ["HD-1002", "Can't upload screenshots to a ticket", "The attachment picker opens but every image fails at 100% with a generic error.", "technical", "normal", "inProgress", "cus_02", "agt_01", 1],
  ["HD-1003", "Password reset email never arrives", "Requested a reset link four times over two hours. Checked spam. Nothing.", "accountIssue", "high", "inProgress", "cus_03", "agt_04", 1],
  ["HD-1004", "Invoice missing VAT number", "Our finance team needs the company VAT ID on the PDF invoice for reimbursement.", "billing", "normal", "resolved", "cus_04", "agt_02", 4, "Added the VAT field to the account and re-issued invoice #INV-20449."],
  ["HD-1005", "App logs me out every few minutes", "Since the last update the session drops constantly on desktop Chrome. Mobile is fine.", "technical", "high", "open", "cus_05", null, 0],
  ["HD-1006", "Request to close my account", "I'd like my account and all associated data deleted per your privacy policy.", "accountIssue", "normal", "closed", "cus_06", "agt_03", 12, "Account scheduled for deletion; confirmation email sent."],
  ["HD-1007", "Dark mode resets on reload", "I set the theme to dark but it flips back to light every time I refresh the dashboard.", "technical", "low", "open", "cus_07", null, 2],
  ["HD-1008", "Downgrade didn't take effect", "Switched from Pro to Starter last week but I'm still being billed the Pro rate.", "billing", "high", "inProgress", "cus_08", "agt_02", 3],
  ["HD-1009", "Export to CSV is empty", "The report export downloads a file with only the header row, no data.", "technical", "normal", "open", "cus_09", null, 1],
  ["HD-1010", "Typo in the confirmation email", "The order confirmation says 'Thank you for you purchase' — missing an r.", "other", "low", "resolved", "cus_10", "agt_01", 6, "Fixed the template typo and redeployed the email service."],
  ["HD-1011", "Two-factor codes rejected", "My authenticator codes are all 'invalid' even though the clock is synced.", "accountIssue", "high", "open", "cus_11", null, 0],
  ["HD-1012", "Refund for accidental purchase", "My kid bought the team add-on on my account. Requesting a refund.", "billing", "normal", "resolved", "cus_12", "agt_02", 5, "Refund of $49 issued to original payment method; add-on removed."],
  ["HD-1013", "Webhooks stopped firing", "No webhook deliveries since Tuesday 14:00 UTC. Endpoint is up and returns 200 in tests.", "technical", "high", "inProgress", "cus_01", "agt_04", 2],
  ["HD-1014", "How do I invite teammates?", "I can't find where to add other people to my workspace.", "other", "low", "closed", "cus_02", "agt_03", 9, "Walked the customer through Settings → Members → Invite."],
  ["HD-1015", "Billing address won't save", "Every time I update the billing country the form clears and nothing persists.", "billing", "normal", "open", "cus_03", null, 1],
  ["HD-1016", "Mobile app crashes on launch", "iOS app version 3.2.1 crashes immediately on open. iPhone 13, iOS 17.4.", "technical", "high", "inProgress", "cus_04", "agt_01", 1],
  ["HD-1017", "Duplicate account under work email", "I signed up with both my personal and work email and want them merged.", "accountIssue", "normal", "open", "cus_05", null, 3],
  ["HD-1018", "Chart tooltips show wrong timezone", "Analytics tooltips display UTC even though my profile is set to CET.", "technical", "low", "open", "cus_06", null, 4],
  ["HD-1019", "Need a copy of past invoices", "Requesting all invoices from Jan–Jun for our annual audit.", "billing", "low", "resolved", "cus_07", "agt_02", 7, "Generated a ZIP of H1 invoices and shared a download link (valid 7 days)."],
  ["HD-1020", "Search returns no results", "Global search finds nothing even for tickets I have open right now.", "technical", "normal", "inProgress", "cus_08", "agt_04", 0],
  ["HD-1021", "Promo code won't apply at checkout", "The code LAUNCH25 is listed as active but checkout says it's expired.", "billing", "normal", "open", "cus_09", null, 0],
  ["HD-1022", "Email notifications too frequent", "I'm getting an email for every single message. Is there a digest option?", "other", "low", "closed", "cus_10", "agt_03", 15, "Enabled hourly digest in the customer's notification settings."],
  ["HD-1023", "API returns 500 on ticket create", "POST /v1/tickets started 500ing this morning. No payload changes on our side.", "technical", "high", "open", "cus_11", null, 0],
  ["HD-1024", "Seat count wrong after removing a user", "Removed a teammate but we're still shown as 8/8 seats used.", "billing", "normal", "inProgress", "cus_12", "agt_02", 2],
  ["HD-1025", "Can't change my registered email", "The email field in profile settings is greyed out and won't let me edit it.", "accountIssue", "normal", "open", "cus_01", null, 5],
  ["HD-1026", "Attachment previews not loading", "Image attachments in the chat show a broken-image icon until I click download.", "technical", "low", "resolved", "cus_02", "agt_01", 8, "CloudFront cache behaviour fixed; previews load inline again."],
  ["HD-1027", "Question about data residency", "Where is our data stored? We have an EU-only requirement.", "other", "normal", "open", "cus_03", null, 2],
  ["HD-1028", "Card declined but plan shows active", "Payment failed per my bank but the app still says my subscription renewed.", "billing", "high", "inProgress", "cus_04", "agt_02", 1],
  ["HD-1029", "Keyboard shortcuts conflict with screen reader", "Pressing J/K to navigate tickets fights with VoiceOver navigation.", "technical", "normal", "open", "cus_05", null, 6],
  ["HD-1030", "Onboarding checklist stuck at 80%", "I've completed every step but the checklist won't mark itself done.", "other", "low", "closed", "cus_06", "agt_03", 11, "Backfilled the missing 'invited a teammate' event; checklist cleared."],
  ["HD-1031", "Bulk status update failed halfway", "Tried to close 40 tickets at once; ~15 changed and the rest errored.", "technical", "normal", "open", "cus_07", null, 1],
  ["HD-1032", "Annual plan renewal reminder request", "Can you email me 14 days before the annual plan renews so I can review seats?", "billing", "low", "open", "cus_08", null, 3],
];

const now = Date.now();
const DAY = 24 * 60 * 60 * 1000;

export const MOCK_TICKETS: Ticket[] = ROWS.map(
  ([ref, title, description, category, priority, status, customerId, agentId, daysAgo, resolutionNote], i) => {
    const createdAt = new Date(now - daysAgo * DAY - i * 37 * 60 * 1000);
    const updatedAt =
      status === "open"
        ? createdAt
        : new Date(Math.min(now, createdAt.getTime() + (daysAgo > 0 ? daysAgo : 1) * 0.5 * DAY));
    return {
      id: `tkt_${ref.toLowerCase().replace("-", "_")}`,
      referenceNumber: ref,
      title,
      description,
      category,
      priority,
      status,
      customer: customerId,
      agent: agentId,
      attachments:
        i % 6 === 0
          ? [
              {
                fileUrl: `https://picsum.photos/seed/${ref}a/640/400`,
                fileType: "image" as const,
                uploadedAt: createdAt,
              },
              {
                fileUrl: `https://picsum.photos/seed/${ref}b/640/400`,
                fileType: "image" as const,
                uploadedAt: createdAt,
              },
            ]
          : undefined,
      statusUpdates: [],
      resolutionNote: resolutionNote,
      createdAt,
      updatedAt,
    };
  },
);
