"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createBrowserSupabaseClient } from "@/lib/db/browserClient";

const links = [
  { href: "/kundli", label: "Free Kundli" },
  { href: "/compatibility", label: "Compatibility" },
  { href: "/chat", label: "Ask Tara" },
  { href: "/timing", label: "Shubh Muhurat" },
  { href: "/horoscope/aries", label: "Horoscope" },
  { href: "/pricing", label: "Pricing" },
];

function initialsFor(email?: string | null, name?: string | null): string {
  const source = name || email || "?";
  return source.trim().charAt(0).toUpperCase();
}

function ProfileAvatar({ label }: { label: string }) {
  return (
    <Link
      href="/profile"
      aria-label="Your profile"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-sm text-white shadow-sm shadow-accent/30 transition-transform hover:scale-105"
    >
      {label}
    </Link>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userLabel, setUserLabel] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setUserLabel(user ? initialsFor(user.email, user.user_metadata?.full_name) : null);
      setAuthChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUserLabel(user ? initialsFor(user.email, user.user_metadata?.full_name) : null);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-xl tracking-wide text-ink">
          Nakshatra<span className="text-accent">.</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {authChecked && !userLabel && (
            <Button href="/login" size="sm" variant="ghost">
              Sign In
            </Button>
          )}
          <Button href="/kundli" size="sm">
            Create your Kundli
          </Button>
          {authChecked && userLabel && <ProfileAvatar label={userLabel} />}
        </div>

        <button
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-black/5 px-5 py-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="py-2 text-sm font-medium text-ink/80"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-3">
            {authChecked && !userLabel && (
              <Button href="/login" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Sign In
              </Button>
            )}
            <Button href="/kundli" size="sm" onClick={() => setOpen(false)}>
              Create your Kundli
            </Button>
            {authChecked && userLabel && <ProfileAvatar label={userLabel} />}
          </div>
        </div>
      )}
    </header>
  );
}
