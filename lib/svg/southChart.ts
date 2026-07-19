// South Indian style Kundli chart, hand-rolled SVG. Signs are fixed to a
// 4x4 grid (perimeter cells only, center 2x2 left empty); the Lagna is
// marked with an "ASC" tag in whichever cell holds the ascending sign.
// Planets are drawn in the cell matching their own sign (not their house).

import type { KundliChart } from "../astro/kundli";
import { SIGNS, SIGNS_HI, type Sign } from "../astro/constants";

const CELL = 100;
const SIZE = CELL * 4;

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

// [row, col] for each sign, in the standard clockwise-from-top-second-cell
// South Indian layout.
const SIGN_GRID_POSITION: Record<Sign, [number, number]> = {
  Pisces: [0, 0],
  Aries: [0, 1],
  Taurus: [0, 2],
  Gemini: [0, 3],
  Aquarius: [1, 0],
  Cancer: [1, 3],
  Capricorn: [2, 0],
  Leo: [2, 3],
  Sagittarius: [3, 0],
  Scorpio: [3, 1],
  Libra: [3, 2],
  Virgo: [3, 3],
};

export function renderSouthChart(chart: KundliChart): string {
  const planetsBySign: Record<string, string[]> = {};
  for (const [name, placement] of Object.entries(chart.planets)) {
    const abbr = PLANET_ABBR[name] ?? name.slice(0, 2);
    const label = placement.retrograde ? `${abbr}(R)` : abbr;
    (planetsBySign[placement.sign] ??= []).push(label);
  }

  const cells = SIGNS.map((sign) => {
    const [row, col] = SIGN_GRID_POSITION[sign];
    const x = col * CELL;
    const y = row * CELL;
    const isLagna = sign === chart.lagna.sign;
    const planets = planetsBySign[sign] ?? [];

    return `
      <g>
        <rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="none" stroke="currentColor" stroke-width="1.5" />
        <text x="${x + 8}" y="${y + 16}" font-size="11" fill="var(--color-accent, #e07a2f)" font-weight="600">${SIGNS_HI[sign]}</text>
        ${isLagna ? `<text x="${x + CELL - 8}" y="${y + 16}" font-size="10" fill="var(--color-gold, #d4af37)" text-anchor="end" font-weight="700">ASC</text>` : ""}
        <text x="${x + CELL / 2}" y="${y + CELL / 2 + 8}" font-size="12" fill="var(--color-ink, #1f1b2e)" text-anchor="middle">${planets.join(" ")}</text>
      </g>`;
  }).join("");

  return `<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="South Indian Kundli chart">
    <rect x="${CELL}" y="${CELL}" width="${CELL * 2}" height="${CELL * 2}" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" />
    ${cells}
  </svg>`;
}
