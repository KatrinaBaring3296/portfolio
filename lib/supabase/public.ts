import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

// A Supabase client with no login, for the public site.
// It can only do what Row Level Security allows visitors to do:
// read non-hidden content and send contact messages.
// (The logged-in admin client comes in Phase 4.)
export function createPublicClient() {
  const { url, key } = getSupabaseEnv();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
