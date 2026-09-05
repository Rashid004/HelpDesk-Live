export function EmptyState({
  icon = "✓",
  title,
  body,
}: {
  icon?: string;
  title: string;
  body: string;
}): React.JSX.Element {
  return (
    <div className="border-[3px] border-dashed border-ink rounded-brut bg-paper p-10 sm:p-14 text-center flex flex-col items-center gap-5">
      <div className="relative">
        <div className="size-20 border-[3px] border-ink rounded-brut bg-brand-blue text-paper shadow-brut grid place-items-center text-3xl font-black">
          {icon}
        </div>
        <div
          aria-hidden
          className="absolute -right-3 -bottom-3 size-8 border-2 border-ink rounded-brut bg-brand-pink shadow-brut-sm"
        />
      </div>
      <div className="flex flex-col gap-2 max-w-sm">
        <h2 className="font-display text-2xl font-black">{title}</h2>
        <p className="text-sm text-muted">{body}</p>
      </div>
    </div>
  );
}
