import Razorpay from "razorpay";
import type { PaymentLinks } from "razorpay/dist/types/paymentLink";
import crypto from "crypto";

let client: Razorpay | null = null;

function getClient(): Razorpay {
  if (!client) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) throw new Error("Razorpay keys are not set");
    client = new Razorpay({ key_id, key_secret });
  }
  return client;
}

export async function createOrder(params: { amountPaise: number; receipt: string }) {
  const razorpay = getClient();
  return razorpay.orders.create({
    amount: params.amountPaise,
    currency: "INR",
    receipt: params.receipt,
  });
}

/**
 * Creates a Razorpay Payment Link — a hosted checkout page (UPI/cards) with
 * a short, shareable URL. Simpler than embedding Checkout.js for an MVP.
 */
export async function createPaymentLink(params: {
  amountPaise: number;
  description: string;
  referenceId: string;
  customerName?: string;
  notes?: Record<string, string>;
  callbackUrl: string;
}): Promise<PaymentLinks.RazorpayPaymentLink> {
  const razorpay = getClient();
  const link = await razorpay.paymentLink.create({
    amount: params.amountPaise,
    currency: "INR",
    description: params.description,
    reference_id: params.referenceId,
    notes: params.notes,
    callback_url: params.callbackUrl,
    callback_method: "get",
    customer: params.customerName ? { name: params.customerName } : {},
  });
  return link;
}

/** Verify a Razorpay webhook signature using the raw request body. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not set");

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
