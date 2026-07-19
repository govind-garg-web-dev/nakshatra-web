"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CompatibilityResult } from "@/components/CompatibilityResult";
import type { GunaMilanResult } from "@/lib/astro/gunaMilan";

interface PersonFields {
  name: string;
  dob: string;
  tob: string;
  city: string;
}

const EMPTY: PersonFields = { name: "", dob: "", tob: "", city: "" };

function PersonFieldset({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PersonFields;
  onChange: (v: PersonFields) => void;
}) {
  return (
    <Card className="p-6">
      <h3 className="font-display text-lg text-ink mb-4">{label}</h3>
      <div className="flex flex-col gap-4">
        <Input label="Name" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} required />
        <Input
          label="Date of birth"
          type="date"
          value={value.dob}
          onChange={(e) => onChange({ ...value, dob: e.target.value })}
          required
        />
        <Input
          label="Time of birth"
          type="time"
          value={value.tob}
          onChange={(e) => onChange({ ...value, tob: e.target.value })}
        />
        <Input
          label="Place of birth"
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          placeholder="City, State, Country"
          required
        />
      </div>
    </Card>
  );
}

export function HumanCompatClient() {
  const [personA, setPersonA] = useState<PersonFields>(EMPTY);
  const [personB, setPersonB] = useState<PersonFields>(EMPTY);
  const [result, setResult] = useState<GunaMilanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personA, personB, mode: "guna" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not compute compatibility");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        <PersonFieldset label="Person 1" value={personA} onChange={setPersonA} />
        <PersonFieldset label="Person 2" value={personB} onChange={setPersonB} />
        <div className="md:col-span-2">
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Calculating…" : "Check Guna Milan"}
          </Button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </form>

      {result && <CompatibilityResult result={result} nameA={personA.name} nameB={personB.name} />}
    </div>
  );
}
