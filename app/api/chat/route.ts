import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/db/client";
import { getProfile } from "@/lib/db/users";
import { listCharts } from "@/lib/db/charts";
import { appendMessage, getRecentMessages } from "@/lib/db/conversations";
import { deductCredit, getBalance } from "@/lib/db/credits";
import { buildChatContext } from "@/lib/ai/context";
import { buildTaraSystemPrompt } from "@/lib/ai/taraPrompt";
import { streamText } from "@/lib/ai/claude";
import { PRODUCTS } from "@/lib/payments/products";
import { logger } from "@/lib/utils/logger";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to chat with Tara" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const balance = await getBalance(user.id);
  if (balance <= 0) {
    return NextResponse.json(
      {
        paywall: true,
        message: "Aapke free questions khatam ho gaye — thoda aur poochna hai?",
        products: [{ id: "questions_20", ...PRODUCTS.questions_20 }],
      },
      { status: 402 }
    );
  }

  const { message } = parsed.data;

  try {
    const [profile, charts, recent] = await Promise.all([
      getProfile(user.id),
      listCharts(user.id),
      getRecentMessages(user.id, 20),
    ]);

    const { contextPreamble, messages } = buildChatContext({
      userName: profile?.name ?? "dost",
      chart: charts[0]?.chart_json ?? null,
      recentMessages: recent.map((m) => ({ role: m.role, content: m.content })),
    });

    await deductCredit(user.id);
    await appendMessage(user.id, "user", message);

    const stream = await streamText({
      system: buildTaraSystemPrompt(contextPreamble),
      messages: [...messages, { role: "user", content: message }],
    });

    let fullText = "";
    const encoder = new TextEncoder();

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              fullText += event.delta.text;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          logger.error("tara stream failed", { error: String(err) });
          controller.enqueue(
            encoder.encode("\n\nMaaf karna, Tara abhi thoda distracted hai — dobara try karein.")
          );
        } finally {
          controller.close();
          if (fullText) {
            await appendMessage(user.id, "assistant", fullText).catch((err) =>
              logger.error("failed to save assistant message", { error: String(err) })
            );
          }
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    logger.error("chat route failed", { error: String(err) });
    return NextResponse.json(
      { error: "Tara is unavailable right now — please try again shortly." },
      { status: 502 }
    );
  }
}
