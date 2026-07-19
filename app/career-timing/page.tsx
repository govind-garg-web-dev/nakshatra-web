import type { Metadata } from "next";
import { CareerTimingClient } from "./CareerTimingClient";

export const metadata: Metadata = {
  title: "Career Timing — When Will I Get The Job?",
  description:
    "Career timing for Gen Z: your 10th house, current Dasha, and concrete windows for job changes and promotions in the next 12 months.",
  alternates: { canonical: "/career-timing" },
};

export default function CareerTimingPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Career Timing</h1>
      <p className="mt-2 max-w-2xl text-ink/60">
        Built for the &quot;when will I get the job?&quot; question — mapped to your 10th house and current Dasha,
        not vague optimism.
      </p>
      <div className="mt-8">
        <CareerTimingClient />
      </div>
    </div>
  );
}
