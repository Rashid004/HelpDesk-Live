import Link from "next/link";
import { Card } from "../components/ui/Card";

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-dvh grid place-items-center bg-cream p-6">
      <Card className="max-w-md w-full text-center flex flex-col items-center gap-4 py-10">
        <span
          aria-hidden
          className="grid size-14 place-items-center border-2 border-ink bg-brand-yellow text-ink rounded-brut text-2xl font-black shadow-brut"
        >
          ?
        </span>
        <h1 className="font-display text-2xl font-black">Page not found</h1>
        <p className="text-sm text-muted">
          That page doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
        <Link
          href="/"
          className="inline-flex items-center border-2 border-ink rounded-brut bg-brand-yellow text-ink font-display font-bold uppercase tracking-[0.08em] text-sm px-6 py-3 shadow-brut press-brut"
        >
          Take me home
        </Link>
      </Card>
    </div>
  );
}
