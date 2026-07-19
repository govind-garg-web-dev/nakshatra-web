import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Compatibility — Guna Milan & Astropsychology",
  description:
    "Check compatibility with your partner using classical 36-point Guna Milan and a psychological astrology read.",
  alternates: { canonical: "/compatibility" },
};

export default function CompatibilityHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Compatibility</h1>
      <p className="mt-2 max-w-2xl text-ink/60">
        Two ways to check your compatibility — pick whichever fits what you&apos;re looking for.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Link href="/compatibility/human">
          <Card className="h-full p-6 transition-transform hover:-translate-y-1 hover:shadow-md">
            <span className="text-3xl">🪔</span>
            <h2 className="font-display mt-3 text-xl text-ink">Guna Milan</h2>
            <p className="mt-2 text-sm text-ink/60">
              The classical 36-point Ashtakoota match, with a full koota breakdown and Mangal Dosha check.
            </p>
          </Card>
        </Link>
        <Link href="/compatibility/psychology">
          <Card className="h-full p-6 transition-transform hover:-translate-y-1 hover:shadow-md">
            <span className="text-3xl">🧠</span>
            <h2 className="font-display mt-3 text-xl text-ink">Astropsychology</h2>
            <p className="mt-2 text-sm text-ink/60">
              A narrative read on temperament, communication, and emotional needs — written by Tara.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
