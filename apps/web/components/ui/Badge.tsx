import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@repo/shared";
import { cn } from "../../lib/cn";

type Tone =
  | "neutral"
  | "yellow"
  | "blue"
  | "pink"
  | "open"
  | "progress"
  | "resolved"
  | "closed"
  | "low"
  | "normal"
  | "high";

const TONES: Record<Tone, string> = {
  neutral: "bg-paper text-ink",
  yellow: "bg-brand-yellow text-ink",
  blue: "bg-brand-blue text-paper",
  pink: "bg-brand-pink text-ink",
  open: "bg-status-open text-ink",
  progress: "bg-status-progress text-paper",
  resolved: "bg-status-resolved text-paper",
  closed: "bg-status-closed text-paper",
  low: "bg-priority-low text-ink",
  normal: "bg-priority-normal text-paper",
  high: "bg-priority-high text-paper",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: BadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center border-2 border-ink rounded-brut px-2.5 py-1",
        "label-brut shadow-brut-sm whitespace-nowrap",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* ---- Domain-specific badges (labels map to human copy) ------------- */

const STATUS_META: Record<TicketStatus, { tone: Tone; label: string }> = {
  open: { tone: "open", label: "Open" },
  inProgress: { tone: "progress", label: "In progress" },
  resolved: { tone: "resolved", label: "Resolved" },
  closed: { tone: "closed", label: "Closed" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: TicketStatus;
  className?: string;
}): React.JSX.Element {
  const meta = STATUS_META[status];
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}

const PRIORITY_META: Record<TicketPriority, { tone: Tone; label: string }> = {
  low: { tone: "low", label: "Low priority" },
  normal: { tone: "normal", label: "Normal" },
  high: { tone: "high", label: "High priority" },
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TicketPriority;
  className?: string;
}): React.JSX.Element {
  const meta = PRIORITY_META[priority];
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}

const CATEGORY_LABEL: Record<TicketCategory, string> = {
  billing: "Billing",
  technical: "Technical",
  accountIssue: "Account issue",
  other: "Other",
};

export function CategoryBadge({
  category,
  className,
}: {
  category: TicketCategory;
  className?: string;
}): React.JSX.Element {
  return (
    <Badge tone="yellow" className={className}>
      {CATEGORY_LABEL[category]}
    </Badge>
  );
}
