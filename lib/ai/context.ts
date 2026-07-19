import type { KundliChart } from "@/lib/astro/kundli";

/** Render a chart as plain, readable text for injecting into a Claude prompt. */
export function chartToReadableText(chart: KundliChart, label = "the person"): string {
  const planetLines = Object.entries(chart.planets)
    .map(
      ([name, p]) =>
        `- ${name}: ${p.sign} (${p.sign_hi}) ${p.degree.toFixed(1)}°, house ${p.house}${p.retrograde ? ", retrograde" : ""}`
    )
    .join("\n");

  const dashaLine = chart.mahadasha
    ? `Currently running ${chart.mahadasha.lord} Mahadasha, ${chart.mahadasha.antardasha.lord} Antardasha.`
    : "Dasha timeline unavailable.";

  return `Chart for ${label}:
Lagna (Ascendant): ${chart.lagna.sign} (${chart.lagna.sign_hi}), lord ${chart.lagna.lord} in house ${chart.lagna.lord_house}
Moon: ${chart.moon.sign}, Nakshatra ${chart.moon.nakshatra} pada ${chart.moon.pada}
${dashaLine}
Planets:
${planetLines}`;
}

export interface ChatContextMessage {
  role: "user" | "assistant";
  content: string;
}

/** Assemble the system-facing context block: profile + chart + recent history. */
export function buildChatContext(params: {
  userName: string;
  chart: KundliChart | null;
  recentMessages: ChatContextMessage[];
}): { contextPreamble: string; messages: ChatContextMessage[] } {
  const chartText = params.chart
    ? chartToReadableText(params.chart, params.userName)
    : `${params.userName} has not saved a birth chart yet — answer generally and encourage them to add their birth details for specific guidance.`;

  const contextPreamble = `User's name: ${params.userName}\n\n${chartText}`;

  return {
    contextPreamble,
    messages: params.recentMessages.slice(-20),
  };
}
