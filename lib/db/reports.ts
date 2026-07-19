import { createServiceRoleClient } from "./client";

export interface Report {
  id: string;
  user_id: string;
  order_id: string;
  type: string;
  content_md: string;
  created_at: string;
}

export async function createReport(params: {
  userId: string;
  orderId: string;
  type: string;
  contentMd: string;
}): Promise<Report> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("reports")
    .insert({ user_id: params.userId, order_id: params.orderId, type: params.type, content_md: params.contentMd })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getReportByOrder(orderId: string): Promise<Report | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("reports").select("*").eq("order_id", orderId).maybeSingle();
  return data;
}
