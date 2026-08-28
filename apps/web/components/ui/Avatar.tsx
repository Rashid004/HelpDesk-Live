import { cn } from "../../lib/cn";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
};

const TONES = ["bg-brand-yellow", "bg-brand-blue text-paper", "bg-brand-pink"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** Deterministic tone so the same name always gets the same color. */
function toneFor(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return TONES[sum % TONES.length]!;
}

export interface AvatarProps {
  name: string;
  size?: Size;
  className?: string;
}

export function Avatar({
  name,
  size = "md",
  className,
}: AvatarProps): React.JSX.Element {
  return (
    <span
      aria-hidden
      title={name}
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        "border-2 border-ink rounded-brut font-display font-bold uppercase",
        "shadow-brut-sm",
        SIZES[size],
        toneFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
