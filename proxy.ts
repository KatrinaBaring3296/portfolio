import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Runs before every /admin page (Next.js 16's name for middleware).
// 1. Refreshes the login cookies so the session doesn't expire mid-visit.
// 2. Sends anyone who isn't the admin to /admin/login.
// This is a fast first gate only: admin pages and actions check again
// (lib/auth.ts), and so does the database.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Pass refreshed cookies to the page and back to the browser
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          // No-cache headers, so a CDN never serves one person's login to another
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email?.toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isAdmin = !!email && !!adminEmail && email === adminEmail;
  const onLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!isAdmin && !onLoginPage) return redirectTo("/admin/login", request, response);
  if (isAdmin && onLoginPage) return redirectTo("/admin", request, response);
  return response;
}

// A redirect that keeps any refreshed login cookies and headers
function redirectTo(path: string, request: NextRequest, from: NextResponse) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  for (const key of ["cache-control", "expires", "pragma"]) {
    const value = from.headers.get(key);
    if (value) redirect.headers.set(key, value);
  }
  return redirect;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
