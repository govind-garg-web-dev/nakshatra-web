import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/db/client";
import { getProduct } from "@/lib/payments/products";
import { createPaymentLink } from "@/lib/payments/razorpay";
import { createOrderRecord } from "@/lib/db/orders";
import { logger } from "@/lib/utils/logger";

const bodySchema = z.object({
  product: z.string(),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to buy this" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const product = getProduct(parsed.data.product);
  if (!product) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  try {
    const link = await createPaymentLink({
      amountPaise: product.amountPaise,
      description: product.label,
      referenceId: `${user.id}-${parsed.data.product}-${Date.now()}`,
      notes: { userId: user.id, product: parsed.data.product },
      callbackUrl: `${baseUrl}/dashboard`,
    });

    // NB: the `orders` table comment says "razorpay order id" but we use the
    // Payment Links API (simpler than embedding Checkout.js for an MVP), so
    // we store the payment link's id here instead of a Checkout order id.
    await createOrderRecord({
      id: link.id,
      userId: user.id,
      product: parsed.data.product as never,
      amount: product.amountPaise,
    });

    return NextResponse.json({ orderId: link.id, shortUrl: link.short_url });
  } catch (err) {
    logger.error("payment link creation failed", { error: String(err) });
    return NextResponse.json({ error: "Could not start payment — please try again" }, { status: 502 });
  }
}
