import {
  ticketCategoryEnum,
  ticketPriorityEnum,
  ticketStatusEnum,
  type TicketCategory,
} from "@repo/shared";
import { STATUS_META, PRIORITY_META } from "./theme";

/** Human labels + antd Select option arrays, all derived from the
 *  shared Zod enums so they can't drift from the backend. */

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  billing: "Billing",
  technical: "Technical",
  accountIssue: "Account issue",
  other: "Other",
};

export const STATUS_OPTIONS = ticketStatusEnum.options.map((value) => ({
  value,
  label: STATUS_META[value].label,
}));

export const PRIORITY_OPTIONS = ticketPriorityEnum.options.map((value) => ({
  value,
  label: PRIORITY_META[value].label,
}));

export const CATEGORY_OPTIONS = ticketCategoryEnum.options.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));
