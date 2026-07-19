import { createServiceRoleClient } from "./client";

export interface Profile {
  id: string;
  name: string | null;
  created_at: string;
  last_active: string;
  tags: string[] | null;
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

/** Appends a life-context tag (e.g. "job_seeker") if the user doesn't already have it. */
export async function addTag(userId: string, tag: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("profiles").select("tags").eq("id", userId).maybeSingle();
  const existing: string[] = data?.tags ?? [];
  if (existing.includes(tag)) return;
  await supabase
    .from("profiles")
    .update({ tags: [...existing, tag] })
    .eq("id", userId);
}
