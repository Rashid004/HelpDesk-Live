"use client";

import { useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

/**
 * App-wide error boundary (Next.js file convention) — catches any render-
 * time error that escapes a page's own try/catch-style handling, instead of
 * a blank white screen or the framework's raw error overlay in production.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    console.error("Unhandled render error:", error);
  }, [error]);

  return (
    <div className="min-h-dvh grid place-items-center bg-cream p-6">
      <Card className="max-w-md w-full text-center flex flex-col items-center gap-4 py-10">
        <span
          aria-hidden
          className="grid size-14 place-items-center border-2 border-ink bg-danger text-paper rounded-brut text-2xl font-black shadow-brut"
        >
          !
        </span>
        <h1 className="font-display text-2xl font-black">Something went wrong</h1>
        <p className="text-sm text-muted">
          That&apos;s on us, not you. Try again — if it keeps happening, come back later.
        </p>
        <Button onClick={reset}>Try again</Button>
      </Card>
    </div>
  );
}
