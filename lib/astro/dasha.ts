import { DASHA_SEQUENCE, DASHA_YEARS, type Planet } from "./constants";
import { getNakshatra, nakshatraElapsedFraction } from "./nakshatra";

const DAYS_PER_YEAR = 365.25;

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * DAYS_PER_YEAR * 24 * 60 * 60 * 1000);
}

export interface Antardasha {
  lord: Planet;
  start: Date;
  end: Date;
}

export interface Mahadasha {
  lord: Planet;
  start: Date;
  end: Date;
  antardashas: Antardasha[];
}

function buildAntardashas(lord: Planet, start: Date, end: Date): Antardasha[] {
  const mahaYears = DASHA_YEARS[lord];
  const startIndex = DASHA_SEQUENCE.indexOf(lord);
  let cursor = start;
  const antardashas: Antardasha[] = [];

  for (let i = 0; i < 9; i++) {
    const subLord = DASHA_SEQUENCE[(startIndex + i) % 9];
    const subYears = (mahaYears * DASHA_YEARS[subLord]) / 120;
    const subEnd = addYears(cursor, subYears);
    antardashas.push({ lord: subLord, start: cursor, end: subEnd });
    cursor = subEnd;
  }

  // Correct any floating point drift so the last antardasha ends exactly at `end`.
  antardashas[antardashas.length - 1].end = end;
  return antardashas;
}

/**
 * Build the full Vimshottari Dasha timeline (120 years, 9 Mahadashas with
 * Antardashas) from the birth date and the Moon's sidereal longitude.
 */
export function buildDashaTimeline(dob: Date, moonSiderealLongitude: number): Mahadasha[] {
  const nakshatra = getNakshatra(moonSiderealLongitude);
  const elapsed = nakshatraElapsedFraction(moonSiderealLongitude);
  const startLord = nakshatra.lord;
  const startIndex = DASHA_SEQUENCE.indexOf(startLord);

  const firstFullYears = DASHA_YEARS[startLord];
  const firstBalanceYears = firstFullYears * (1 - elapsed);

  const timeline: Mahadasha[] = [];
  let cursor = dob;

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_SEQUENCE[(startIndex + i) % 9];
    const years = i === 0 ? firstBalanceYears : DASHA_YEARS[lord];
    const end = addYears(cursor, years);
    timeline.push({ lord, start: cursor, end, antardashas: buildAntardashas(lord, cursor, end) });
    cursor = end;
  }

  return timeline;
}

export interface ActiveDasha {
  mahadasha: Mahadasha;
  antardasha: Antardasha;
}

/** Find the active Mahadasha + Antardasha for a given date (defaults to now). */
export function getActiveDasha(timeline: Mahadasha[], asOf: Date = new Date()): ActiveDasha | null {
  const maha = timeline.find((m) => asOf >= m.start && asOf < m.end);
  if (!maha) return null;
  const antar = maha.antardashas.find((a) => asOf >= a.start && asOf < a.end) ?? maha.antardashas[0];
  return { mahadasha: maha, antardasha: antar };
}
