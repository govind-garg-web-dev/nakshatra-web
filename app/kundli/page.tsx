import type { Metadata } from "next";
import { KundliClient } from "./KundliClient";

export const metadata: Metadata = {
  title: "Free Kundli — Vedic Birth Chart Generator",
  description:
    "Generate your free, accurate Vedic birth chart (Kundli) online. See your Lagna, planets, Nakshatra, and Vimshottari Dasha in North or South Indian chart styles.",
  alternates: { canonical: "/kundli" },
  openGraph: {
    title: "Free Kundli — Vedic Birth Chart Generator | Nakshatra",
    description: "Generate your free, accurate Vedic birth chart online in under a minute.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Nakshatra Free Kundli",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  description: "Free Vedic birth chart (Kundli) generator with North & South Indian chart styles and Dasha timeline.",
};

export default function KundliPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="font-display text-3xl text-ink md:text-4xl">Your Free Kundli</h1>
      <p className="mt-2 max-w-2xl text-ink/60">
        Enter your birth details for an instant, accurate Vedic birth chart — Lagna, planets, Nakshatra, and your
        current Dasha, explained in plain language.
      </p>
      <div className="mt-8">
        <KundliClient />
      </div>
    </div>
  );
}
