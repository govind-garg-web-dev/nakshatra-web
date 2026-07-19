"use client";

import { FormEvent, useState } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { EventType, MuhurtaWindow } from "@/lib/astro/muhurta";

const EVENT_OPTIONS: { value: EventType; label: string }[] = [
  { value: "wedding", label: "Wedding" },
  { value: "travel", label: "Travel" },
  { value: "business_launch", label: "Business Launch" },
  { value: "house_warming", label: "House Warming (Griha Pravesh)" },
  { value: "education", label: "Education / Exams" },
  { value: "general", label: "General / Other" },
];

function defaultRange() {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 30);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export function TimingClient() {
  const initial = defaultRange();
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [windows, setWindows] = useState<MuhurtaWindow[] | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/muhurta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, from, to }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not compute windows");
      setWindows(data.windows);
      setNarrative(data.narrative ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select label="Event type" value={eventType} onChange={(e) => setEventType(e.target.value as EventType)}>
            {EVENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
          <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Finding windows…" : "Find auspicious dates"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {windows === null && (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-black/10 text-center text-ink/40">
            Your top 5 dates will appear here
          </div>
        )}
        {narrative && (
          <Card className="p-5">
            <h3 className="font-display text-lg text-ink mb-2">Tara&apos;s recommendation</h3>
            <p className="whitespace-pre-line text-ink/80 leading-relaxed">{narrative}</p>
          </Card>
        )}
        {windows?.map((w) => (
          <Card key={w.date} className="flex items-center justify-between p-5">
            <div>
              <p className="font-display text-lg text-ink">
                {new Date(w.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-sm text-ink/60">
                {w.tithi} · Moon in {w.nakshatra}
              </p>
              <p className="mt-1 text-sm text-ink/70">{w.reason}</p>
            </div>
            <div className="font-display text-2xl text-accent">{w.score}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
