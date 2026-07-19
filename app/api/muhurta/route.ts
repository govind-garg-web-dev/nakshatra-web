import { NextResponse } from "next/server";
import { z } from "zod";
import { findMuhurtaWindows } from "@/lib/astro/muhurta";

const bodySchema = z.object({
  eventType: z.enum(["wedding", "travel", "business_launch", "house_warming", "education", "general"]),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { eventType, from, to } = parsed.data;

  const fromDate = new Date(from);
  const toDate = new Date(to);
  const spanDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
  if (spanDays < 0 || spanDays > 120) {
    return NextResponse.json({ error: "Date range must be between 0 and 120 days" }, { status: 400 });
  }

  // TODO(founder): personalize scoring using the user's own chart (Moon sign
  // compatibility, current Dasha) once a saved chart is passed in.
  const windows = findMuhurtaWindows(eventType, from, to);

  return NextResponse.json({ windows });
}
