import { createBrowserClient } from "@supabase/ssr";

// A Supabase client for code running in the browser (Client Components).
// It shares the login cookies with the server, so it acts as the admin when
// you're logged in. Used for file uploads, which go straight to Supabase
// Storage instead of through our server (server actions are limited to 1 MB).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
