/** Full-viewport loading state, bordered to match the aesthetic. */
export function ScreenLoader({
  label = "Loading…",
}: {
  label?: string;
}): React.JSX.Element {
  return (
    <div className="min-h-dvh grid place-items-center bg-cream p-6">
      <div className="flex items-center gap-3 border-[3px] border-ink rounded-brut bg-paper px-6 py-4 shadow-brut">
        <span
          aria-hidden
          className="size-5 border-2 border-ink border-t-transparent rounded-full animate-spin"
        />
        <span className="label-brut">{label}</span>
      </div>
    </div>
  );
}
