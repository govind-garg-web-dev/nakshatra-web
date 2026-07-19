"use client";

import type { GunaMilanResult } from "@/lib/astro/gunaMilan";
import { Card } from "@/components/ui/Card";

function verdictFor(total: number): { label: string; color: string } {
  if (total >= 28) return { label: "Excellent match", color: "text-emerald-600" };
  if (total >= 21) return { label: "Good match", color: "text-accent" };
  if (total >= 15) return { label: "Average match — worth discussing openly", color: "text-amber-600" };
  return { label: "Challenging — consider consulting further", color: "text-red-600" };
}

export function CompatibilityResult({
  result,
  nameA,
  nameB,
  narrative,
}: {
  result: GunaMilanResult;
  nameA: string;
  nameB: string;
  narrative?: string | null;
}) {
  const verdict = verdictFor(result.total);

  return (
    <div className="flex flex-col gap-6">
      <Card className="night-gradient star-field p-8 text-center text-cream">
        <p className="text-sm uppercase tracking-widest text-cream/60">
          {nameA} &amp; {nameB}
        </p>
        <p className="font-display mt-2 text-6xl text-gold">
          {result.total}
          <span className="text-2xl text-cream/50">/{result.maxTotal}</span>
        </p>
        <p className={`mt-2 text-lg font-medium ${verdict.color === "text-red-600" ? "text-red-300" : "text-cream"}`}>
          {verdict.label}
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="font-display text-lg text-ink mb-4">Koota breakdown</h3>
        <div className="flex flex-col gap-3">
          {result.breakdown.map((k) => (
            <div key={k.koota}>
              <div className="mb-1 flex justify-between text-sm text-ink/70">
                <span>{k.koota}</span>
                <span>
                  {k.score}/{k.max}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-black/5">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${(k.score / k.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display text-lg text-ink mb-2">Mangal Dosha</h3>
        <p className="text-ink/70">{result.mangalDosha.note}</p>
      </Card>

      {narrative && (
        <Card className="p-6">
          <h3 className="font-display text-lg text-ink mb-2">Tara&apos;s take</h3>
          <p className="whitespace-pre-line text-ink/80 leading-relaxed">{narrative}</p>
        </Card>
      )}
    </div>
  );
}
