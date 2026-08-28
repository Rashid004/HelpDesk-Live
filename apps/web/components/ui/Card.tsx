import { cn } from "../../lib/cn";

type Tone = "paper" | "cream" | "yellow" | "blue";

const TONES: Record<Tone, string> = {
  paper: "bg-paper",
  cream: "bg-cream",
  yellow: "bg-brand-yellow",
  blue: "bg-brand-blue text-paper",
};

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  tone?: Tone;
  /** Adds the press-shift effect — use only for clickable cards. */
  interactive?: boolean;
  as?: React.ElementType;
}

export function Card({
  tone = "paper",
  interactive = false,
  as: Tag = "div",
  className,
  children,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <Tag
      className={cn(
        "border-[3px] border-ink rounded-brut shadow-brut p-6",
        TONES[tone],
        interactive &&
          "press-brut cursor-pointer focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn("mb-4 flex flex-col gap-1", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return (
    <h3
      className={cn("text-xl font-display font-extrabold leading-tight", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn("flex flex-col gap-4", className)} {...props} />;
}
