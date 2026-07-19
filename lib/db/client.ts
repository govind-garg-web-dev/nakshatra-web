import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// See the same note in ./browserClient.ts — placeholders keep the app
// runnable before Supabase is configured; auth simply won't work until real
// values are set.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Browser-side client lives in ./browserClient.ts (import it directly from
// "use client" components) — kept separate so client bundles never pull in
// `next/headers` transitively.

/** Server Component / Route Handler client, reads the user's session cookies. */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component (not a Route Handler/Server
          // Action) — cookies can't be written here. Safe to ignore as long
          // as a middleware/route handler refreshes the session elsewhere.
        }
      },
    },
  });
}

/**
 * Admin client using the service role key — server-only, bypasses RLS.
 * Never import this from client components or expose the key to the browser.
 */
export function createServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
