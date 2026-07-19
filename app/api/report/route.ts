import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/db/client";
import { getChart } from "@/lib/db/charts";
import { listPaidOrders } from "@/lib/db/orders";
import { getReportByOrder, createReport } from "@/lib/db/reports";
import { chartToReadableText } from "@/lib/ai/context";
import { generateText } from "@/lib/ai/claude";
import { getProduct, type ProductId } from "@/lib/payments/products";
import { logger } from "@/lib/utils/logger";

const bodySchema = z.object({
  type: z.string(),
  chartId: z.string().uuid(),
});

const REPORT_TYPE_TO_PRODUCT: Record<string, ProductId> = {
  yearly: "yearly_report",
  career: "career_report",
  muhurta: "muhurta_report",
  guna: "guna_report",
};

const REPORT_PROMPTS: Record<ProductId, string> = {
  yearly_report:
    "Write a detailed year-ahead forecast: key themes by quarter, the active Mahadasha/Antardasha's influence, and one concrete action per quarter. Markdown with headings. Warm Hinglish. 500-700 words.",
  career_report:
    "Write a career-timing report: current Dasha's effect on career, the 10th house and its lord's placement, best windows (specific months) for job changes or promotions in the next 12 months, and 2 concrete actions. Markdown with headings. Warm Hinglish. 500-700 words.",
  muhurta_report:
    "Write a personalized auspicious-timing guide: how this person's Moon sign and current Dasha should factor into picking dates for major life events over the next 6 months. Markdown with headings. Warm Hinglish. 400-600 words.",
  guna_report:
    "Write a compatibility-readiness report focused on this one chart: their emotional needs (Moon), communication style (Mercury), and what kind of partner nakshatra/temperament would complement them well. Note: a full two-chart Guna Milan is available separately. Markdown with headings. Warm Hinglish. 400-600 words.",
  questions_20: "",
};

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const product = REPORT_TYPE_TO_PRODUCT[parsed.data.type];
  if (!product || !getProduct(product)) {
    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }

  const paidOrders = await listPaidOrders(user.id, product);
  if (paidOrders.length === 0) {
    return NextResponse.json({ error: "No paid order found for this report — please purchase it first" }, { status: 402 });
  }

  // Reuse an already-generated report for the most recent paid order if one exists.
  for (const order of paidOrders) {
    const existing = await getReportByOrder(order.id);
    if (existing) {
      return NextResponse.json({ reportId: existing.id, content_md: existing.content_md });
    }
  }

  const chart = await getChart(parsed.data.chartId);
  if (!chart || chart.user_id !== user.id) {
    return NextResponse.json({ error: "Chart not found" }, { status: 404 });
  }

  try {
    const contentMd = await generateText({
      system:
        "You are Tara, Nakshatra's astrologer, writing a paid deep-dive report. Be specific — cite real planets/houses/Dasha from the chart given, never generic zodiac fluff. Never guarantee outcomes; frame as guidance.",
      prompt: `${chartToReadableText(chart.chart_json, chart.label)}\n\n${REPORT_PROMPTS[product]}`,
      maxTokens: 1600,
    });

    const report = await createReport({
      userId: user.id,
      orderId: paidOrders[0].id,
      type: product,
      contentMd,
    });

    return NextResponse.json({ reportId: report.id, content_md: report.content_md });
  } catch (err) {
    logger.error("report generation failed", { error: String(err) });
    return NextResponse.json({ error: "Could not generate report — please try again" }, { status: 502 });
  }
}
