import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SIGNS_HI, SLUG_TO_SIGN } from "@/lib/astro/constants";
import { getDailyHoroscope } from "@/lib/ai/horoscope";
import { Card } from "@/components/ui/Card";
import { ZodiacGrid } from "@/components/ZodiacGrid";
import { logger } from "@/lib/utils/logger";

// NB: deliberately not using generateStaticParams here — these pages call
// the Anthropic API to generate today's text, which needs ANTHROPIC_API_KEY
// at request time. Prerendering at build time would require that key to be
// present during `next build` (e.g. in CI) and would bake in stale text for
// the whole day. Each sign is rendered per-request instead and cached for an
// hour via `revalidate` below, which still yields indexable, server-rendered
// HTML for SEO.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}): Promise<Metadata> {
  const { sign: slug } = await params;
  const sign = SLUG_TO_SIGN[slug.toLowerCase()];
  if (!sign) return {};

  return {
    title: `${sign} Daily Horoscope — Today's Reading`,
    description: `Today's horoscope for ${sign} (${SIGNS_HI[sign]}) — a specific, actionable read updated daily.`,
    alternates: { canonical: `/horoscope/${slug}` },
  };
}

export default async function HoroscopePage({ params }: { params: Promise<{ sign: string }> }) {
  const { sign: slug } = await params;
  const sign = SLUG_TO_SIGN[slug.toLowerCase()];
  if (!sign) notFound();

  let date = new Date().toISOString().slice(0, 10);
  let text = "Aaj ka horoscope thoda late aa raha hai — thodi der mein wapas check karein.";
  try {
    const result = await getDailyHoroscope(sign);
    date = result.date;
    text = result.text;
  } catch (err) {
    logger.error("horoscope page generation failed", { error: String(err), sign });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${sign} Daily Horoscope`,
    datePublished: date,
    author: { "@type": "Organization", name: "Nakshatra" },
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-sm uppercase tracking-widest text-accent">
        {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
      </p>
      <h1 className="font-display mt-2 text-3xl text-ink md:text-4xl">
        {sign} <span className="text-ink/40">({SIGNS_HI[sign]})</span> Horoscope
      </h1>

      <Card className="mt-8 p-6">
        <p className="leading-relaxed text-ink/80">{text}</p>
      </Card>

      <p className="mt-6 text-sm text-ink/50">
        Want a reading specific to your own birth chart, not just your sun sign?{" "}
        <Link href="/kundli" className="text-accent underline">
          Create your free Kundli
        </Link>
        .
      </p>

      <div className="mt-12">
        <h2 className="font-display text-xl text-ink mb-4">Other signs</h2>
        <ZodiacGrid />
      </div>
    </div>
  );
}
