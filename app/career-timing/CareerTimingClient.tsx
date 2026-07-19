"use client";

import { useState } from "react";
import { BirthForm, type BirthDetails } from "@/components/BirthForm";
import { Card } from "@/components/ui/Card";
import { formatDateForDisplay } from "@/lib/utils/dates";

interface CareerResult {
  reading: string;
  tenthHouseSign: string;
  tenthHousePlanet: string | null;
  mahadasha: {
    lord: string;
    antardasha: { lord: string; start: string; end: string };
  } | null;
}

export function CareerTimingClient() {
  const [result, setResult] = useState<CareerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(details: BirthDetails) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/career-timing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate your reading");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <Card className="h-fit p-6">
        <h2 className="font-display text-xl text-ink mb-4">When will I get the job?</h2>
        <BirthForm onSubmit={handleSubmit} loading={loading} submitLabel="Find my career window" />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </Card>

      <div>
        {result ? (
          <div className="flex flex-col gap-6">
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4 text-sm text-ink/60">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink/40">10th house sign</p>
                  <p className="font-display text-lg text-ink">{result.tenthHouseSign}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink/40">Planet in 10th house</p>
                  <p className="font-display text-lg text-ink">{result.tenthHousePlanet ?? "None"}</p>
                </div>
                {result.mahadasha && (
                  <div className="col-span-2">
                    <p className="text-xs uppercase tracking-wide text-ink/40">Current Dasha</p>
                    <p className="font-display text-lg text-ink">
                      {result.mahadasha.lord} / {result.mahadasha.antardasha.lord} (until{" "}
                      {formatDateForDisplay(result.mahadasha.antardasha.end)})
                    </p>
                  </div>
                )}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-lg text-ink mb-3">Your reading</h3>
              <p className="whitespace-pre-line leading-relaxed text-ink/80">{result.reading}</p>
            </Card>
          </div>
        ) : (
          <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-black/10 text-center text-ink/40">
            Your career timing reading will appear here
          </div>
        )}
      </div>
    </div>
  );
}
