import type { Metadata } from "next";
import { TimingClient } from "./TimingClient";

export const metadata: Metadata = {
  title: "Shubh Muhurat — Find Auspicious Dates",
  description:
    "Find the best auspicious dates and times for weddings, travel, business launches, house warming, and more.",
  alternates: { canonical: "/timing" },
};

export default function TimingPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Shubh Muhurat</h1>
      <p className="mt-2 max-w-2xl text-ink/60">
        Pick an event and a date range — we&apos;ll score each day by tithi, weekday, and Moon nakshatra to find
        your top 5 windows.
      </p>
      <div className="mt-8">
        <TimingClient />
      </div>
    </div>
  );
}
