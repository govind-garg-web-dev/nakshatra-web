import type { KundliChart } from "@/lib/astro/kundli";

/** Today's date, human-readable — Claude has no other way to know "today". */
export function todayReadable(): string {
  return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** Render a chart as plain, readable text for injecting into a Claude prompt. */
export function chartToReadableText(chart: KundliChart, label = "the person"): string {
  const planetLines = Object.entries(chart.planets)
    .map(
      ([name, p]) =>
        `- ${name}: ${p.sign} (${p.sign_hi}) ${p.degree.toFixed(1)}°, house ${p.house}${p.retrograde ? " [Vakri/retrograde]" : ""}`
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
  tags?: string[];
}): { contextPreamble: string; messages: ChatContextMessage[] } {
  const chartText = params.chart
    ? chartToReadableText(params.chart, params.userName)
    : `${params.userName} has not saved a birth chart yet — answer generally and encourage them to add their birth details for specific guidance.`;

  const tagsLine =
    params.tags && params.tags.length > 0
      ? `\n\nKnown concerns from past conversation: ${params.tags.join(", ")}`
      : "";

  const contextPreamble = `User's name: ${params.userName}
Today's date: ${todayReadable()}

${chartText}${tagsLine}`;

  return {
    contextPreamble,
    messages: params.recentMessages.slice(-20),
  };
}
