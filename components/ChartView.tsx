"use client";

import { useState } from "react";
import type { KundliChart } from "@/lib/astro/kundli";
import { renderNorthChart } from "@/lib/svg/northChart";
import { renderSouthChart } from "@/lib/svg/southChart";
import { formatDateForDisplay } from "@/lib/utils/dates";
import { Card } from "@/components/ui/Card";

type Style = "north" | "south";

export function ChartView({ chart, name }: { chart: KundliChart; name?: string }) {
  const [style, setStyle] = useState<Style>("north");

  const svg = style === "north" ? renderNorthChart(chart) : renderSouthChart(chart);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">{name ? `${name}'s Kundli` : "Your Kundli"}</h2>
        <div className="flex gap-1 rounded-full bg-black/5 p-1">
          {(["north", "south"] as Style[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                style === s ? "bg-white shadow-sm text-ink" : "text-ink/50"
              }`}
            >
              {s} Indian
            </button>
          ))}
        </div>
      </div>

      <Card className="p-6">
        <div className="mx-auto max-w-md text-ink" dangerouslySetInnerHTML={{ __html: svg }} />
      </Card>

      <Card className="p-6">
        <h3 className="font-display text-lg text-ink mb-3">Plain-language reading</h3>
        <p className="text-ink/80 leading-relaxed">
          Aapka Lagna (Ascendant) <strong>{chart.lagna.sign}</strong> hai, jiska swami{" "}
          <strong>{chart.lagna.lord}</strong> hai — yeh aapke personality aur life approach ko shape karta hai. Aapka
          Chandra (Moon) <strong>{chart.moon.sign}</strong> rashi mein <strong>{chart.moon.nakshatra}</strong> nakshatra
          (pada {chart.moon.pada}) mein hai, jo aapki emotional nature dikhata hai.
          {chart.mahadasha && (
            <>
              {" "}
              Abhi aap <strong>{chart.mahadasha.lord} Mahadasha</strong> mein hain, saath mein{" "}
              <strong>{chart.mahadasha.antardasha.lord} Antardasha</strong> chal raha hai (
              {formatDateForDisplay(chart.mahadasha.antardasha.start)} se{" "}
              {formatDateForDisplay(chart.mahadasha.antardasha.end)} tak).
            </>
          )}
        </p>
      </Card>

      <Card className="overflow-x-auto p-6">
        <h3 className="font-display text-lg text-ink mb-3">Planet positions</h3>
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-ink/50">
              <th className="py-2 pr-4 font-medium">Planet</th>
              <th className="py-2 pr-4 font-medium">Sign</th>
              <th className="py-2 pr-4 font-medium">Degree</th>
              <th className="py-2 pr-4 font-medium">House</th>
              <th className="py-2 font-medium">Retrograde</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(chart.planets).map(([planet, p]) => (
              <tr key={planet} className="border-b border-black/5 last:border-0">
                <td className="py-2 pr-4 font-medium text-ink">{planet}</td>
                <td className="py-2 pr-4">
                  {p.sign} <span className="text-ink/40">({p.sign_hi})</span>
                </td>
                <td className="py-2 pr-4">{p.degree.toFixed(1)}°</td>
                <td className="py-2 pr-4">{p.house}</td>
                <td className="py-2">{p.retrograde ? "Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
