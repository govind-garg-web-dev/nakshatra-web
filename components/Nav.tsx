"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/kundli", label: "Free Kundli" },
  { href: "/compatibility", label: "Compatibility" },
  { href: "/chat", label: "Ask Tara" },
  { href: "/timing", label: "Shubh Muhurat" },
  { href: "/horoscope/aries", label: "Horoscope" },
  { href: "/pricing", label: "Pricing" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

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

        <div className="hidden md:block">
          <Button href="/kundli" size="sm">
            Create your Kundli
          </Button>
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
          <Button href="/kundli" size="sm" className="mt-2 w-fit">
            Create your Kundli
          </Button>
        </div>
      )}
    </header>
  );
}
