import type { Metadata } from "next";
import { HumanCompatClient } from "./HumanCompatClient";

export const metadata: Metadata = {
  title: "Guna Milan — 36-Point Compatibility Matching",
  description:
    "Classical Ashtakoota Guna Milan compatibility check — 36-point breakdown across Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi, plus Mangal Dosha.",
  alternates: { canonical: "/compatibility/human" },
};

export default function HumanCompatibilityPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Guna Milan Compatibility</h1>
      <p className="mt-2 max-w-2xl text-ink/60">
        Enter both birth details for the classical 36-point Ashtakoota match, koota-by-koota, plus a Mangal Dosha
        check.
      </p>
      <div className="mt-8">
        <HumanCompatClient />
      </div>
    </div>
  );
}
