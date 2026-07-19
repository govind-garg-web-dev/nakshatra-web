"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingPhrases } from "@/components/ui/LoadingPhrases";

const LOADING_PHRASES = [
  "Reading both charts…",
  "Comparing temperaments…",
  "Checking Sun, Moon, and Mars…",
  "Understanding how you two click…",
  "Almost there…",
];

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

export function PsychologyCompatClient() {
  const [personA, setPersonA] = useState<PersonFields>(EMPTY);
  const [personB, setPersonB] = useState<PersonFields>(EMPTY);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setText(null);
    try {
      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personA, personB, mode: "psychology" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate the reading");
      setText(data.result.text);
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
        <div className="md:col-span-2 flex flex-col gap-3">
          <Button type="submit" disabled={loading} size="lg" className="w-fit">
            {loading ? "Tara is reading your charts…" : "Get the psychology read"}
          </Button>
          <LoadingPhrases phrases={LOADING_PHRASES} active={loading} />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </form>

      {text && (
        <Card className="p-6">
          <h3 className="font-display text-lg text-ink mb-3">
            {personA.name} &amp; {personB.name}
          </h3>
          <p className="whitespace-pre-line text-ink/80 leading-relaxed">{text}</p>
        </Card>
      )}
    </div>
  );
}
