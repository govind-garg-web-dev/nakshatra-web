import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Nakshatra's free and paid features.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink/40">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <div className="prose-ink mt-6 flex flex-col gap-5 text-ink/70 leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-ink">Using Nakshatra</h2>
          <p className="mt-2">
            Free tools (Kundli, horoscope, basic compatibility, 3 daily AI questions) are available to everyone.
            Paid reports and additional AI questions are one-time purchases via Razorpay — no subscriptions, no
            auto-renewal.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink">Payments &amp; refunds</h2>
          <p className="mt-2">
            All prices are shown before payment and charged only once you confirm. Digital reports are generated
            immediately after payment is confirmed; if a report fails to generate, contact us for a refund.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink">Nature of the service</h2>
          <p className="mt-2">
            Nakshatra provides astrology for guidance and self-reflection — not deterministic fact, and not a
            substitute for professional medical, legal, or financial advice.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink">Account termination</h2>
          <p className="mt-2">
            You may delete your account at any time. We may suspend accounts that abuse the service (e.g.
            automated scraping of the AI chat).
          </p>
        </section>
      </div>
    </div>
  );
}
