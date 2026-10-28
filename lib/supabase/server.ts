import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

// A Supabase client that knows who's logged in (reads the login cookies).
// Use it in admin pages and server actions. Create a new one per request.
export async function createClient() {
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Pages can't set cookies, only server actions can. That's fine:
          // proxy.ts refreshes the login cookies before admin pages render.
        }
      },
    },
  });
}
