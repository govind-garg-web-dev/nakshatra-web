import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ZodiacGrid } from "@/components/ZodiacGrid";

const SERVICES = [
  {
    href: "/kundli",
    title: "Free Birth Chart",
    desc: "Instant, accurate Kundli with North & South Indian styles, Dasha timeline, and a plain-language reading.",
    icon: "✨",
  },
  {
    href: "/compatibility",
    title: "Astropsychology",
    desc: "Understand your temperament through Sun, Moon, and Mars — not just sun-sign horoscopes.",
    icon: "🧠",
  },
  {
    href: "/compatibility/human",
    title: "Compatibility",
    desc: "36-point Guna Milan plus a psychological read on how you and your partner actually click.",
    icon: "💞",
  },
  {
    href: "/timing",
    title: "Shubh Muhurat",
    desc: "Find auspicious dates for weddings, travel, launches, and more.",
    icon: "🕰️",
  },
  {
    href: "/chat",
    title: "AI Astrologer",
    desc: "Chat with Tara — specific answers citing your actual planets, houses, and Dasha.",
    icon: "💬",
  },
  {
    href: "/career-timing",
    title: "Career Timing",
    desc: '"When will I get the job?" — 10th-house and Dasha-based career windows for Gen Z.',
    icon: "💼",
  },
];

const WHY = [
  { title: "Astropsychology framework", desc: "We connect classical Vedic placements to real temperament and behavior, not vague fortune-telling." },
  { title: "Instant insights", desc: "No waiting for a human astrologer — your chart and first reading are ready in seconds." },
  { title: "100% privacy", desc: "Your birth details stay yours. We never sell data, and deletion is always two taps away." },
];

const STEPS = [
  { title: "Enter your birth details", desc: "Date, time (or sunrise if unsure), and place — takes 30 seconds." },
  { title: "Get your chart instantly", desc: "See your Lagna, planets, Dasha, and a plain-language reading." },
  { title: "Go deeper", desc: "Ask Tara a question, check compatibility, or pick an auspicious date." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="night-gradient star-field px-5 py-24 text-center text-cream md:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-gold">Vedic astrology, reimagined</p>
          <h1 className="font-display text-balance text-4xl leading-tight md:text-6xl">
            Ancient Wisdom for <span className="text-accent-light">Modern Decisions</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/70">
            Free birth charts, compatibility matching, and an AI astrologer who actually cites your chart —
            built for a generation that wants specifics, not vague predictions.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button href="/kundli" size="lg">
              Create your free Kundli
            </Button>
            <Button href="/chat" size="lg" variant="ghost" className="border-cream/30 text-cream hover:bg-cream/10">
              Ask Tara a question
            </Button>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-center text-3xl text-ink">For Humans</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink/60">
          Every tool grounded in your real birth chart — not generic sun-sign horoscopes.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link key={s.href} href={s.href}>
              <Card className="h-full p-6 transition-transform hover:-translate-y-1 hover:shadow-md">
                <span className="text-3xl">{s.icon}</span>
                <h3 className="font-display mt-3 text-xl text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{s.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Why choose Nakshatra */}
      <section className="bg-black/[0.02] px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-center text-3xl text-ink">Why choose Nakshatra</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {WHY.map((w) => (
              <div key={w.title} className="text-center">
                <h3 className="font-display text-xl text-ink">{w.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatibility teaser */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Card className="grid gap-8 p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="font-display text-3xl text-ink">Who loves more? What&apos;s the breakup risk?</h2>
            <p className="mt-4 text-ink/60">
              Our compatibility tool goes beyond a single score — see hidden patterns in how you and your partner
              communicate, argue, and grow together.
            </p>
            <Button href="/compatibility/human" className="mt-6">
              Check compatibility
            </Button>
          </div>
          <div className="flex items-center justify-center rounded-xl bg-black/[0.03] p-8 text-center text-ink/40">
            <p className="font-display text-2xl">36/36 Guna Milan · Mangal Dosha · Shareable card</p>
          </div>
        </Card>
      </section>

      {/* How it works */}
      <section className="bg-black/[0.02] px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-center text-3xl text-ink">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent font-display text-lg text-white">
                  {i + 1}
                </div>
                <h3 className="font-display mt-4 text-lg text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily horoscope grid */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-center text-3xl text-ink">Today&apos;s Horoscope</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink/60">Pick your sign for a specific, actionable read.</p>
        <div className="mt-10">
          <ZodiacGrid />
        </div>
      </section>

      {/* Free Kundli explainer */}
      <section className="bg-black/[0.02] px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-3xl text-ink">Your birth chart, done right</h2>
            <p className="mt-4 text-ink/60">
              Lagna, planets, Nakshatra, Vimshottari Dasha, and a reading that actually explains what it means for
              you — free, forever, in under a minute.
            </p>
            <Button href="/kundli" className="mt-6">
              Create your free Kundli
            </Button>
          </div>
          <div className="flex items-center justify-center rounded-xl bg-white p-8 shadow-sm">
            <p className="font-display text-center text-xl text-ink/50">
              North &amp; South Indian chart styles · Dasha timeline · Downloadable
            </p>
          </div>
        </div>
      </section>

      {/* Niche hook explainer */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Card className="night-gradient star-field grid gap-8 p-8 text-cream md:grid-cols-2 md:p-12">
          <div>
            <h2 className="font-display text-3xl">&quot;When will I get the job?&quot;</h2>
            <p className="mt-4 text-cream/70">
              Career Timing maps your 10th house and current Dasha to concrete windows for job changes, promotions,
              and breakthroughs — built for Gen Z navigating a tough market.
            </p>
            <Button href="/career-timing" variant="secondary" className="mt-6 bg-accent hover:bg-accent-light">
              Find your career window
            </Button>
          </div>
        </Card>
      </section>

      {/* Trust band */}
      <section className="border-t border-black/5 px-5 py-14">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-center text-sm text-ink/50">
          <p className="font-display text-lg text-ink">Made in Bharat, for the world</p>
          <p className="max-w-2xl">
            Rooted in classical Vedic astrology, presented for guidance and self-reflection. We never sell your
            data, and every chart stays private to you.
          </p>
        </div>
      </section>
    </div>
  );
}
