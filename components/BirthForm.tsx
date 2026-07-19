"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface BirthDetails {
  name: string;
  dob: string; // YYYY-MM-DD
  tob: string;
  city: string;
}

export function BirthForm({
  onSubmit,
  loading,
  submitLabel = "Generate my Kundli",
  showName = true,
}: {
  onSubmit: (details: BirthDetails) => void;
  loading?: boolean;
  submitLabel?: string;
  showName?: boolean;
}) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [dontKnowTime, setDontKnowTime] = useState(false);
  const [city, setCity] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ name, dob, tob: dontKnowTime ? "sunrise" : tob, city });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {showName && (
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aapka naam" required />
      )}
      <Input
        label="Date of birth"
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        required
        max={new Date().toISOString().slice(0, 10)}
      />
      <div>
        <Input
          label="Time of birth"
          type="time"
          value={tob}
          onChange={(e) => setTob(e.target.value)}
          disabled={dontKnowTime}
          required={!dontKnowTime}
        />
        <label className="mt-2 flex items-center gap-2 text-sm text-ink/60">
          <input
            type="checkbox"
            checked={dontKnowTime}
            onChange={(e) => setDontKnowTime(e.target.checked)}
            className="h-4 w-4 rounded border-black/20"
          />
          I don&apos;t know the exact time (we&apos;ll use sunrise)
        </label>
      </div>
      <Input
        label="Place of birth"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City, State, Country"
        required
      />
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "Calculating…" : submitLabel}
      </Button>
    </form>
  );
}
