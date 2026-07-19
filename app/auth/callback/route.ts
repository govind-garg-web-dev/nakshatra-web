import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/client";
import { ensureProfile } from "@/lib/db/users";

// Handles both the magic-link/OAuth "code" exchange and phone OTP redirects.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profile";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await ensureProfile(data.user.id, data.user.user_metadata?.full_name ?? null);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
