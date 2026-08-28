import type { Metadata } from "next";
import { Logo } from "../../components/brand/Logo";

export const metadata: Metadata = {
  title: "Sign in — HelpDesk Live",
};

/**
 * Split layout shared by /signin and /signup.
 * Branding panel sits on the left on desktop, stacks on top on mobile.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-dvh grid lg:grid-cols-[1.05fr_1fr]">
      {/* Branding side */}
      <aside className="relative overflow-hidden bg-brand-blue text-paper border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-ink px-6 py-10 sm:px-10 lg:px-14 lg:py-16 flex flex-col justify-between gap-12">
        <Logo invert />

        <div className="flex flex-col gap-6 max-w-md">
          <h1 className="font-display text-4xl sm:text-5xl font-black leading-[1.05] text-paper">
            Support that answers back — in real time.
          </h1>
          <p className="text-base sm:text-lg text-paper/90 leading-relaxed">
            Raise a ticket, attach a screenshot, and chat live with the agent
            handling your case. No queues that go quiet. No black holes.
          </p>

          <ul className="flex flex-col gap-3">
            {[
              "Live chat on every ticket",
              "See when an agent is typing",
              "Email + rating when it's resolved",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid size-6 place-items-center border-2 border-ink bg-brand-yellow text-ink rounded-brut text-xs font-black shadow-brut-sm"
                >
                  ✓
                </span>
                <span className="font-medium text-paper">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="label-brut text-paper/70">Trusted by 2,400+ support teams</p>
      </aside>

      {/* Form side */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
