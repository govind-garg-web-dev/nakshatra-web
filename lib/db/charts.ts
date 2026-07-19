import { createServiceRoleClient } from "./client";
import type { KundliChart } from "@/lib/astro/kundli";

export interface SavedChart {
  id: string;
  user_id: string;
  label: string;
  dob: string;
  tob: string | null;
  pob: string | null;
  latitude: number;
  longitude: number;
  chart_json: KundliChart;
  created_at: string;
}

export async function saveChart(params: {
  userId: string;
  label: string;
  dob: string;
  tob?: string;
  pob?: string;
  latitude: number;
  longitude: number;
  chart: KundliChart;
}): Promise<SavedChart> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("charts")
    .insert({
      user_id: params.userId,
      label: params.label,
      dob: params.dob,
      tob: params.tob ?? null,
      pob: params.pob ?? null,
      latitude: params.latitude,
      longitude: params.longitude,
      chart_json: params.chart,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listCharts(userId: string): Promise<SavedChart[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("charts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getChart(chartId: string): Promise<SavedChart | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("charts").select("*").eq("id", chartId).maybeSingle();
  return data;
}
