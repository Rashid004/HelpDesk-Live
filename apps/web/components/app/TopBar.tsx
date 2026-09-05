"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "../ui/Avatar";
import { Logo } from "../brand/Logo";
import { cn } from "../../lib/cn";
import { logout } from "../../lib/api";
import { homeFor } from "../../hooks/useAuthGuard";
import type { UserView } from "../../lib/types";

export function TopBar({ user }: { user: UserView }): React.JSX.Element {
  const isAgent = user.role === "agent";
  return (
    <header className="border-b-[3px] border-ink bg-paper relative z-30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href={homeFor(user.role)} aria-label="HelpDesk Live — dashboard">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          {/* Styled as a Button but semantically a link (navigates to a route) */}
          {!isAgent && (
            <Link
              href="/tickets/new"
              className="inline-flex items-center border-2 border-ink rounded-brut bg-brand-yellow text-ink font-display font-bold uppercase tracking-[0.08em] text-xs sm:text-sm px-4 py-2.5 shadow-brut press-brut"
            >
              + New ticket
            </Link>
          )}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}

function UserMenu({ user }: { user: UserView }): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function handleSignOut(): Promise<void> {
    setLoggingOut(true);
    setOpen(false);
    // Best-effort server-side revoke of the refresh token, then always
    // clears the local session regardless of whether the network call
    // succeeded — see lib/api.ts's logout().
    await logout();
    router.replace("/signin");
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 border-2 border-ink rounded-brut bg-paper px-2 py-1.5 shadow-brut-sm press-brut"
      >
        <Avatar name={user.fullName} size="sm" />
        <span className="hidden md:block text-sm font-bold max-w-[10rem] truncate">
          {user.fullName}
        </span>
        <span aria-hidden className="text-xs">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] z-40",
            "bg-paper border-[3px] border-ink rounded-brut shadow-brut-lg overflow-hidden",
          )}
        >
          <div className="px-4 py-3 border-b-2 border-ink">
            <p className="font-bold text-sm truncate">{user.fullName}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
            <p className="label-brut mt-1">{user.role}</p>
          </div>
          <MenuItem href={homeFor(user.role)}>
            {user.role === "agent" ? "Ticket queue" : "My tickets"}
          </MenuItem>
          {user.role === "customer" && <MenuItem href="/tickets/new">New ticket</MenuItem>}
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="w-full text-left px-4 py-3 text-sm font-bold text-danger border-t-2 border-ink hover:bg-danger/10 disabled:opacity-60"
          >
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Link
      href={href}
      role="menuitem"
      className="block px-4 py-3 text-sm font-bold hover:bg-brand-yellow/40"
    >
      {children}
    </Link>
  );
}
