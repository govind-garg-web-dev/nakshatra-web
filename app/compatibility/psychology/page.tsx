import type { Metadata } from "next";
import { PsychologyCompatClient } from "./PsychologyCompatClient";

export const metadata: Metadata = {
  title: "Astropsychology Compatibility",
  description:
    "A psychological astrology read on temperament, communication style, and emotional needs between you and your partner.",
  alternates: { canonical: "/compatibility/psychology" },
};

export default function PsychologyCompatibilityPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Astropsychology Compatibility</h1>
      <p className="mt-2 max-w-2xl text-ink/60">
        Beyond a score — a narrative read on how your temperaments actually interact, written by Tara.
      </p>
      <div className="mt-8">
        <PsychologyCompatClient />
      </div>
    </div>
  );
}
