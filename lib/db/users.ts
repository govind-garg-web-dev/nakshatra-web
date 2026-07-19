import { createServiceRoleClient } from "./client";

export interface Profile {
  id: string;
  name: string | null;
  created_at: string;
  last_active: string;
}

/** Ensures a profile + starting credits row exist for a freshly signed-in user. */
export async function ensureProfile(userId: string, name?: string | null): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();

  if (!existing) {
    await supabase.from("profiles").insert({ id: userId, name: name ?? null });
    await supabase.from("credits").insert({ user_id: userId, balance: 3 });
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

export async function touchLastActive(userId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.from("profiles").update({ last_active: new Date().toISOString() }).eq("id", userId);
}
