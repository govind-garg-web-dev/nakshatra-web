import { createBrowserClient } from "@supabase/ssr";

// Fall back to harmless placeholders when Supabase isn't configured yet, so
// `next build`'s prerender pass (and local dev before you've set up a
// project) doesn't crash on client components that construct this client at
// render time. Auth calls will simply fail at runtime until you set
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY for real.
// TODO(founder): set these in .env.local / your Vercel project settings.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/** Browser-side client — safe to use in "use client" components. */
export function createBrowserSupabaseClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
