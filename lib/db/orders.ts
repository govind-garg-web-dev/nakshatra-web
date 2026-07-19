import { createServiceRoleClient } from "./client";
import type { ProductId } from "@/lib/payments/products";

export interface Order {
  id: string; // razorpay order id
  user_id: string;
  product: ProductId;
  amount: number; // paise
  status: "created" | "paid" | "failed";
  created_at: string;
  paid_at: string | null;
}

export async function createOrderRecord(params: {
  id: string;
  userId: string;
  product: ProductId;
  amount: number;
}): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("orders").insert({
    id: params.id,
    user_id: params.userId,
    product: params.product,
    amount: params.amount,
    status: "created",
  });
  if (error) throw error;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  return data;
}

export async function markOrderPaid(orderId: string): Promise<Order | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markOrderFailed(orderId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
}

export async function listPaidOrders(userId: string, product: ProductId): Promise<Order[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .eq("product", product)
    .eq("status", "paid")
    .order("paid_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
