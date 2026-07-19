import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PRODUCTS } from "@/lib/payments/products";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Flat, one-time pricing — no subscriptions, no auto-renewal. Free Kundli and horoscope always free.",
  alternates: { canonical: "/pricing" },
};

const FREE_FEATURES = [
  "Full birth chart (Kundli) with Dasha timeline",
  "Daily horoscope for all 12 signs",
  "Basic compatibility score",
  "3 AI questions with Tara per day",
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-center text-3xl text-ink md:text-4xl">Simple, honest pricing</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-ink/60">
        No subscriptions. No auto-renewal. Pay once via UPI or card for what you need.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <Card className="p-8">
          <h2 className="font-display text-xl text-ink">Always free</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-ink/70">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <Button href="/kundli" className="mt-6">
            Start free
          </Button>
        </Card>

        <Card className="p-8">
          <h2 className="font-display text-xl text-ink">Pay-as-you-go</h2>
          <ul className="mt-4 flex flex-col gap-4 text-sm">
            {Object.entries(PRODUCTS).map(([id, product]) => (
              <li key={id} className="flex items-center justify-between border-b border-black/5 pb-3 last:border-0">
                <div>
                  <p className="font-medium text-ink">{product.label}</p>
                  <p className="text-ink/50">{product.description}</p>
                </div>
                <p className="font-display text-lg text-accent">₹{product.amountPaise / 100}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
