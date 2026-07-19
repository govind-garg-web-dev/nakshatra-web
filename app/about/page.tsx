import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Nakshatra blends classical Vedic astrology with modern psychology for Gen Z and millennials.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink md:text-4xl">About Nakshatra</h1>
      <div className="prose-ink mt-6 flex flex-col gap-4 text-ink/70 leading-relaxed">
        <p>
          Nakshatra exists for people who find sun-sign horoscopes too vague to be useful, but classical astrology
          too dense to approach. We built the tools we wished existed: a birth chart that&apos;s accurate and
          instant, a compatibility check that goes past a single number, and an AI astrologer who actually cites
          your chart instead of talking in circles.
        </p>
        <p>
          Every calculation on Nakshatra — your Lagna, planetary positions, Nakshatra, and Vimshottari Dasha — runs
          on deterministic astronomy in our own code, not a third-party API. Our AI layer, Tara, is built on
          Anthropic&apos;s Claude, grounded in your real chart data before it ever writes a word to you.
        </p>
        <p>
          We present astrology as a tool for guidance and self-reflection — not deterministic fact, and never a
          substitute for medical, legal, or financial advice. Your data stays yours: we never sell it, and deleting
          your account is always two taps away.
        </p>
      </div>
    </div>
  );
}
