// Ashtakoota (36-point) Guna Milan between two Kundli charts.
//
// This computes each koota symmetrically — score(A, B) === score(B, A) —
// which is a deliberate simplification. Classical texts apply some directional
// groom/bride rules (notably for Varna and Vashya) that this tool does not
// distinguish, since we don't always know which chart is the groom's.
// TODO(founder): if you learn which chart is groom vs bride, consider
// reinstating the directional Varna/Vashya rules from a classical reference
// (e.g. Brihat Parashara Hora Shastra) for stricter traditional accuracy.
// TODO(founder): the Yoni enemy-pair list and Vashya group boundaries below
// are commonly-cited simplifications — verify against a trusted classical
// table before relying on this for paid reports.

import type { KundliChart } from "./kundli";
import { NAKSHATRAS, SIGNS, type Sign } from "./constants";

const nakshatraIndex = (name: string) => NAKSHATRAS.findIndex((n) => n.name === name);
const signIndex = (sign: Sign) => SIGNS.indexOf(sign);

// ---------- Varna (1 point) ----------
const VARNA_RANK: Record<Sign, number> = {
  Cancer: 4,
  Scorpio: 4,
  Pisces: 4, // Brahmin
  Aries: 3,
  Leo: 3,
  Sagittarius: 3, // Kshatriya
  Taurus: 2,
  Virgo: 2,
  Capricorn: 2, // Vaishya
  Gemini: 1,
  Libra: 1,
  Aquarius: 1, // Shudra
};

function varnaKoota(signA: Sign, signB: Sign) {
  const score = VARNA_RANK[signA] === VARNA_RANK[signB] ? 1 : 0;
  return { name: "Varna", score, max: 1 };
}

// ---------- Vashya (2 points) ----------
type VashyaGroup = "Chatushpada" | "Nara" | "Jalachar" | "Vanachar" | "Keeta";

const VASHYA_GROUP: Record<Sign, VashyaGroup> = {
  Aries: "Chatushpada",
  Taurus: "Chatushpada",
  Sagittarius: "Chatushpada",
  Capricorn: "Chatushpada",
  Gemini: "Nara",
  Virgo: "Nara",
  Libra: "Nara",
  Aquarius: "Nara",
  Cancer: "Jalachar",
  Pisces: "Jalachar",
  Leo: "Vanachar",
  Scorpio: "Keeta",
};

const VASHYA_SCORE: Record<VashyaGroup, Record<VashyaGroup, number>> = {
  Chatushpada: { Chatushpada: 2, Nara: 1, Jalachar: 1, Vanachar: 0.5, Keeta: 0 },
  Nara: { Chatushpada: 1, Nara: 2, Jalachar: 1, Vanachar: 0.5, Keeta: 0 },
  Jalachar: { Chatushpada: 1, Nara: 1, Jalachar: 2, Vanachar: 0.5, Keeta: 0 },
  Vanachar: { Chatushpada: 0.5, Nara: 0.5, Jalachar: 0.5, Vanachar: 2, Keeta: 0.5 },
  Keeta: { Chatushpada: 0, Nara: 0, Jalachar: 0, Vanachar: 0.5, Keeta: 2 },
};

function vashyaKoota(signA: Sign, signB: Sign) {
  const gA = VASHYA_GROUP[signA];
  const gB = VASHYA_GROUP[signB];
  return { name: "Vashya", score: VASHYA_SCORE[gA][gB], max: 2 };
}

// ---------- Tara (3 points) ----------
const TARA_INAUSPICIOUS = new Set([3, 5, 7]); // Vipat, Pratyak, Vadha

function taraDirectionScore(fromIdx: number, toIdx: number): number {
  const count = ((toIdx - fromIdx + 27) % 27) + 1;
  const taraNumber = ((count - 1) % 9) + 1;
  return TARA_INAUSPICIOUS.has(taraNumber) ? 0 : 1.5;
}

function taraKoota(nakA: string, nakB: string) {
  const a = nakshatraIndex(nakA);
  const b = nakshatraIndex(nakB);
  const score = taraDirectionScore(a, b) + taraDirectionScore(b, a);
  return { name: "Tara", score, max: 3 };
}

// ---------- Yoni (4 points) ----------
const YONI: Record<string, string> = {
  Ashwini: "Horse",
  Bharani: "Elephant",
  Krittika: "Sheep",
  Rohini: "Serpent",
  Mrigashira: "Serpent",
  Ardra: "Dog",
  Punarvasu: "Cat",
  Pushya: "Sheep",
  Ashlesha: "Cat",
  Magha: "Rat",
  "Purva Phalguni": "Rat",
  "Uttara Phalguni": "Cow",
  Hasta: "Buffalo",
  Chitra: "Tiger",
  Swati: "Buffalo",
  Vishakha: "Tiger",
  Anuradha: "Deer",
  Jyeshtha: "Deer",
  Mula: "Dog",
  "Purva Ashadha": "Monkey",
  "Uttara Ashadha": "Mongoose",
  Shravana: "Monkey",
  Dhanishta: "Lion",
  Shatabhisha: "Horse",
  "Purva Bhadrapada": "Lion",
  "Uttara Bhadrapada": "Cow",
  Revati: "Elephant",
};

const YONI_ENEMY_PAIRS: [string, string][] = [
  ["Rat", "Cat"],
  ["Cow", "Tiger"],
  ["Elephant", "Lion"],
  ["Serpent", "Mongoose"],
  ["Dog", "Deer"],
  ["Horse", "Buffalo"],
  ["Sheep", "Monkey"],
];

function areYoniEnemies(a: string, b: string): boolean {
  return YONI_ENEMY_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function yoniKoota(nakA: string, nakB: string) {
  const yA = YONI[nakA];
  const yB = YONI[nakB];
  let score = 2; // neutral by default
  if (yA === yB) score = 4;
  else if (areYoniEnemies(yA, yB)) score = 0;
  return { name: "Yoni", score, max: 4 };
}

// ---------- Graha Maitri (5 points) ----------
type PlanetName = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn";

const RASHI_LORD: Record<Sign, PlanetName> = {
  Aries: "Mars",
  Scorpio: "Mars",
  Taurus: "Venus",
  Libra: "Venus",
  Gemini: "Mercury",
  Virgo: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Sagittarius: "Jupiter",
  Pisces: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
};

// Classical Naisargika (natural) friendship table.
const FRIENDS: Record<PlanetName, PlanetName[]> = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"],
};
const ENEMIES: Record<PlanetName, PlanetName[]> = {
  Sun: ["Venus", "Saturn"],
  Moon: [],
  Mars: ["Mercury"],
  Mercury: ["Moon"],
  Jupiter: ["Mercury", "Venus"],
  Venus: ["Sun", "Moon"],
  Saturn: ["Sun", "Moon", "Mars"],
};

function relation(a: PlanetName, b: PlanetName): "friend" | "neutral" | "enemy" {
  if (FRIENDS[a].includes(b)) return "friend";
  if (ENEMIES[a].includes(b)) return "enemy";
  return "neutral";
}

function grahaMaitriKoota(signA: Sign, signB: Sign) {
  const lordA = RASHI_LORD[signA];
  const lordB = RASHI_LORD[signB];

  if (lordA === lordB) return { name: "Graha Maitri", score: 5, max: 5 };

  const relAtoB = relation(lordA, lordB);
  const relBtoA = relation(lordB, lordA);
  const pair = [relAtoB, relBtoA].sort().join("-");

  const table: Record<string, number> = {
    "friend-friend": 4,
    "friend-neutral": 3,
    "neutral-neutral": 2,
    "enemy-friend": 1,
    "enemy-neutral": 1,
    "enemy-enemy": 0,
  };

  return { name: "Graha Maitri", score: table[pair] ?? 1, max: 5 };
}

// ---------- Gana (6 points) ----------
type Gana = "Deva" | "Manushya" | "Rakshasa";

const GANA: Record<string, Gana> = {
  Ashwini: "Deva",
  Mrigashira: "Deva",
  Punarvasu: "Deva",
  Pushya: "Deva",
  Hasta: "Deva",
  Swati: "Deva",
  Anuradha: "Deva",
  Shravana: "Deva",
  Revati: "Deva",
  Bharani: "Manushya",
  Rohini: "Manushya",
  Ardra: "Manushya",
  "Purva Phalguni": "Manushya",
  "Uttara Phalguni": "Manushya",
  "Purva Ashadha": "Manushya",
  "Uttara Ashadha": "Manushya",
  "Purva Bhadrapada": "Manushya",
  "Uttara Bhadrapada": "Manushya",
  Krittika: "Rakshasa",
  Ashlesha: "Rakshasa",
  Magha: "Rakshasa",
  Chitra: "Rakshasa",
  Vishakha: "Rakshasa",
  Jyeshtha: "Rakshasa",
  Mula: "Rakshasa",
  Dhanishta: "Rakshasa",
  Shatabhisha: "Rakshasa",
};

const GANA_SCORE: Record<Gana, Record<Gana, number>> = {
  Deva: { Deva: 6, Manushya: 5, Rakshasa: 0 },
  Manushya: { Deva: 5, Manushya: 6, Rakshasa: 1 },
  Rakshasa: { Deva: 0, Manushya: 1, Rakshasa: 6 },
};

function ganaKoota(nakA: string, nakB: string) {
  const gA = GANA[nakA];
  const gB = GANA[nakB];
  return { name: "Gana", score: GANA_SCORE[gA][gB], max: 6 };
}

// ---------- Bhakoot (7 points) ----------
const BHAKOOT_DOSHA_COUNTS = new Set([2, 5, 6, 8, 9, 12]);

function bhakootKoota(signA: Sign, signB: Sign) {
  const a = signIndex(signA);
  const b = signIndex(signB);
  const count = ((b - a + 12) % 12) + 1;
  const dosha = BHAKOOT_DOSHA_COUNTS.has(count);
  return { name: "Bhakoot", score: dosha ? 0 : 7, max: 7 };
}

// ---------- Nadi (8 points) ----------
type Nadi = "Aadi" | "Madhya" | "Antya";

const NADI: Record<string, Nadi> = {
  Ashwini: "Aadi",
  Ardra: "Aadi",
  Punarvasu: "Aadi",
  "Uttara Phalguni": "Aadi",
  Hasta: "Aadi",
  Jyeshtha: "Aadi",
  Mula: "Aadi",
  Shatabhisha: "Aadi",
  "Purva Bhadrapada": "Aadi",
  Bharani: "Madhya",
  Mrigashira: "Madhya",
  Pushya: "Madhya",
  "Purva Phalguni": "Madhya",
  Chitra: "Madhya",
  Anuradha: "Madhya",
  "Purva Ashadha": "Madhya",
  Dhanishta: "Madhya",
  "Uttara Bhadrapada": "Madhya",
  Krittika: "Antya",
  Rohini: "Antya",
  Ashlesha: "Antya",
  Magha: "Antya",
  Swati: "Antya",
  Vishakha: "Antya",
  "Uttara Ashadha": "Antya",
  Shravana: "Antya",
  Revati: "Antya",
};

function nadiKoota(nakA: string, nakB: string, signA: Sign, signB: Sign) {
  const nA = NADI[nakA];
  const nB = NADI[nakB];
  if (nA !== nB) return { name: "Nadi", score: 8, max: 8, doshaCancelled: false };

  // Commonly-applied cancellation: same Nadi but different nakshatra or
  // different rashi is treated as cancelled by many practitioners.
  const cancelled = nakA !== nakB || signA !== signB;
  return { name: "Nadi", score: cancelled ? 8 : 0, max: 8, doshaCancelled: cancelled };
}

// ---------- Mangal (Mars) Dosha ----------
const MANGAL_DOSHA_HOUSES = new Set([1, 2, 4, 7, 8, 12]);

function mangalDoshaFor(chart: KundliChart): boolean {
  return MANGAL_DOSHA_HOUSES.has(chart.planets.Mars.house);
}

export interface GunaMilanResult {
  total: number;
  maxTotal: 36;
  breakdown: { koota: string; score: number; max: number }[];
  mangalDosha: {
    personA: boolean;
    personB: boolean;
    cancelled: boolean;
    note: string;
  };
}

export function gunaMilan(personA: KundliChart, personB: KundliChart): GunaMilanResult {
  const signA = personA.moon.sign;
  const signB = personB.moon.sign;
  const nakA = personA.moon.nakshatra;
  const nakB = personB.moon.nakshatra;

  const kootas = [
    varnaKoota(signA, signB),
    vashyaKoota(signA, signB),
    taraKoota(nakA, nakB),
    yoniKoota(nakA, nakB),
    grahaMaitriKoota(signA, signB),
    ganaKoota(nakA, nakB),
    bhakootKoota(signA, signB),
    nadiKoota(nakA, nakB, signA, signB),
  ];

  const total = Math.round(kootas.reduce((sum, k) => sum + k.score, 0) * 100) / 100;

  const mdA = mangalDoshaFor(personA);
  const mdB = mangalDoshaFor(personB);
  const cancelled = mdA && mdB;

  return {
    total,
    maxTotal: 36,
    breakdown: kootas.map(({ name, score, max }) => ({ koota: name, score, max })),
    mangalDosha: {
      personA: mdA,
      personB: mdB,
      cancelled,
      note:
        mdA && mdB
          ? "Both charts show Mangal Dosha, which classically cancels itself out between the two."
          : mdA || mdB
          ? "One chart shows Mangal Dosha — many practitioners see this as manageable, not a hard blocker."
          : "No Mangal Dosha detected in either chart.",
    },
  };
}
