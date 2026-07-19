// Single source of truth for pricing. Flat fees, no subscriptions, editable
// here only — never hardcode a price anywhere else in the app.

export const PRODUCTS = {
  questions_20: { label: "20 AI Questions", amountPaise: 9900, description: "20 more questions with Tara" },
  yearly_report: { label: "Yearly Forecast Report", amountPaise: 19900, description: "Detailed year-ahead reading" },
  guna_report: { label: "Guna Milan Deep Report", amountPaise: 24900, description: "Full compatibility breakdown" },
  career_report: { label: "Career Report", amountPaise: 34900, description: "Career timing & Dasha analysis" },
  muhurta_report: { label: "Muhurta Report", amountPaise: 14900, description: "Auspicious timing for your event" },
} as const;

export type ProductId = keyof typeof PRODUCTS;

export function getProduct(id: string) {
  if (!(id in PRODUCTS)) return null;
  return PRODUCTS[id as ProductId];
}
