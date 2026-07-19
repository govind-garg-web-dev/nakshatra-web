import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { getOrder, markOrderPaid, markOrderFailed } from "@/lib/db/orders";
import { addCredits } from "@/lib/db/credits";
import { logger } from "@/lib/utils/logger";

// TODO(founder): the masterplan's Section 10 has the webhook generate paid
// reports directly. We instead just mark the order paid + top up credits
// here, and let POST /api/report (called by the client right after it sees
// the payment confirmed) do the actual report generation — the webhook has
// no `chartId` to know which saved chart the report should use, and
// generating it lazily avoids doing LLM work for a page the user may not
// even return to.

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    logger.warn("razorpay webhook signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event as string;

  try {
    if (event === "payment_link.paid" || event === "payment.captured") {
      const linkEntity = payload.payload?.payment_link?.entity;
      const orderId: string | undefined = linkEntity?.id ?? payload.payload?.payment?.entity?.order_id;
      const notes = linkEntity?.notes ?? payload.payload?.payment?.entity?.notes ?? {};

      if (!orderId) {
        return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
      }

      const order = await getOrder(orderId);
      if (!order) {
        logger.warn("webhook for unknown order", { orderId });
        return NextResponse.json({ received: true });
      }

      await markOrderPaid(orderId);

      if (order.product === "questions_20" && notes.userId) {
        await addCredits(notes.userId, 20);
      }
    } else if (event === "payment_link.cancelled" || event === "payment.failed") {
      const orderId = payload.payload?.payment_link?.entity?.id ?? payload.payload?.payment?.entity?.order_id;
      if (orderId) await markOrderFailed(orderId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("webhook handling failed", { error: String(err), event });
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
