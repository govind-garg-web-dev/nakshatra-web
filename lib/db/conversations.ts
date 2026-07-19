import { createServiceRoleClient } from "./client";

export interface ConversationMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export async function appendMessage(
  userId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("conversations").insert({ user_id: userId, role, content });
  if (error) throw error;
}

export async function getRecentMessages(userId: string, limit = 20): Promise<ConversationMessage[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).reverse();
}
