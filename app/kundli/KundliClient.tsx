"use client";

import { useState } from "react";
import { BirthForm, type BirthDetails } from "@/components/BirthForm";
import { ChartView } from "@/components/ChartView";
import { Card } from "@/components/ui/Card";
import type { KundliChart } from "@/lib/astro/kundli";

export function KundliClient() {
  const [chart, setChart] = useState<KundliChart | null>(null);
  const [chartName, setChartName] = useState<string>("");
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(details: BirthDetails) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kundli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not compute your chart");
      setChart(data.chart);
      setChartName(details.name);
      setReading(data.reading ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <Card className="h-fit p-6">
        <h2 className="font-display text-xl text-ink mb-4">Enter your birth details</h2>
        <BirthForm onSubmit={handleSubmit} loading={loading} />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </Card>

      <div>
        {chart ? (
          <ChartView chart={chart} name={chartName} reading={reading} />
        ) : (
          <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-black/10 text-center text-ink/40">
            Your Kundli will appear here
          </div>
        )}
      </div>
    </div>
  );
}
