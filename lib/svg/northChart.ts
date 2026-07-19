// North Indian style Kundli chart, hand-rolled SVG. House 1 (Lagna) is
// always the top-center triangle; house numbers are fixed to their
// geometric position and the *sign number* shown in each house is derived
// from the Lagna sign. Planets are drawn in the house they occupy.

import type { KundliChart } from "../astro/kundli";
import { SIGNS } from "../astro/constants";

const SIZE = 400;
const C = SIZE / 2;

const PLANET_ABBR: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

// Vertices used to build the 12 house polygons (see lib/svg notes in repo
// history for the derivation): outer square corners, edge midpoints, and the
// center, all on a 0-400 grid.
const TL = [0, 0];
const TR = [SIZE, 0];
const BR = [SIZE, SIZE];
const BL = [0, SIZE];
const MT = [C, 0];
const MR = [SIZE, C];
const MB = [C, SIZE];
const ML = [0, C];
const CTR = [C, C];
const P_TR = [300, 100];
const P_BR = [300, 300];
const P_BL = [100, 300];
const P_TL = [100, 100];

const HOUSE_POLYGONS: [number, number][][] = [
  [TL, TR, CTR] as [number, number][], // 1
  [TR, MT, P_TR] as [number, number][], // 2
  [TR, MR, P_TR] as [number, number][], // 3
  [TR, BR, CTR] as [number, number][], // 4
  [BR, MR, P_BR] as [number, number][], // 5
  [BR, MB, P_BR] as [number, number][], // 6
  [BR, BL, CTR] as [number, number][], // 7
  [BL, MB, P_BL] as [number, number][], // 8
  [BL, ML, P_BL] as [number, number][], // 9
  [BL, TL, CTR] as [number, number][], // 10
  [TL, ML, P_TL] as [number, number][], // 11
  [TL, MT, P_TL] as [number, number][], // 12
];

function centroid(points: [number, number][]): [number, number] {
  const x = points.reduce((s, p) => s + p[0], 0) / points.length;
  const y = points.reduce((s, p) => s + p[1], 0) / points.length;
  return [x, y];
}

// Text anchor offsets: house-number label sits toward the outer edge, planet
// labels sit closer to the center, so they don't overlap.
const SIGN_LABEL_OFFSET: [number, number][] = [
  [0, -28],
  [0, -18],
  [18, 0],
  [28, 0],
  [18, 0],
  [0, 18],
  [0, 28],
  [0, 18],
  [-18, 0],
  [-28, 0],
  [-18, 0],
  [0, -18],
];

export function renderNorthChart(chart: KundliChart): string {
  const lagnaSignIndex = SIGNS.indexOf(chart.lagna.sign);

  const planetsByHouse: Record<number, string[]> = {};
  for (const [name, placement] of Object.entries(chart.planets)) {
    const abbr = PLANET_ABBR[name] ?? name.slice(0, 2);
    const label = placement.retrograde ? `${abbr}(R)` : abbr;
    (planetsByHouse[placement.house] ??= []).push(label);
  }

  const lines = [
    `<line x1="${TL[0]}" y1="${TL[1]}" x2="${BR[0]}" y2="${BR[1]}" />`,
    `<line x1="${TR[0]}" y1="${TR[1]}" x2="${BL[0]}" y2="${BL[1]}" />`,
    `<polygon points="${MT.join(",")} ${MR.join(",")} ${MB.join(",")} ${ML.join(",")}" fill="none" />`,
  ];

  const houseContent = HOUSE_POLYGONS.map((poly, i) => {
    const houseNumber = i + 1;
    const signNumber = ((lagnaSignIndex + houseNumber - 1) % 12) + 1;
    const [cx, cy] = centroid(poly);
    const [ox, oy] = SIGN_LABEL_OFFSET[i];
    const planetLabels = planetsByHouse[houseNumber] ?? [];

    const signLabel = `<text x="${cx + ox}" y="${cy + oy}" font-size="13" fill="var(--color-accent, #e07a2f)" text-anchor="middle" font-weight="600">${signNumber}</text>`;

    const planetText =
      planetLabels.length > 0
        ? `<text x="${cx}" y="${cy + 4}" font-size="12" fill="var(--color-ink, #1f1b2e)" text-anchor="middle">${planetLabels.join(" ")}</text>`
        : "";

    return signLabel + planetText;
  }).join("");

  return `<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="North Indian Kundli chart">
    <rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="none" stroke="currentColor" stroke-width="2" />
    <g stroke="currentColor" stroke-width="1.5" fill="none">${lines.join("")}</g>
    ${houseContent}
  </svg>`;
}
