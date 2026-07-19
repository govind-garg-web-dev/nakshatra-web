import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Astrology on Nakshatra is offered for guidance and self-reflection, not deterministic fact.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Disclaimer</h1>

      <div className="prose-ink mt-6 flex flex-col gap-5 text-ink/70 leading-relaxed">
        <p>
          Nakshatra presents Vedic astrology as a tool for guidance and self-reflection, not as deterministic fact.
          Charts, readings, and AI responses (including Tara) are generated from birth details you provide and
          classical astrological methods — they are not scientifically validated predictions.
        </p>
        <p>
          Nakshatra does not provide medical, legal, or financial advice, and never predicts death, disease, or
          harm. For decisions in these areas, please consult a qualified professional.
        </p>
        <p>
          Our house system (whole-sign) and planetary calculations use a low-precision ephemeris designed for
          everyday use, generally accurate to within about a degree. For situations requiring arc-minute precision
          (e.g. formal Muhurat for major ceremonies), we recommend cross-checking with a qualified astrologer.
        </p>
      </div>
    </div>
  );
}
