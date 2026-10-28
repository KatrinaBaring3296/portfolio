import { io } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

// The single admin check used by every admin page and server action.
// (proxy.ts does a quick version too, and the database's RLS rules
// check again, so all three layers must agree before anything changes.)

/** True if this email is the one in ADMIN_EMAIL. */
export function isAdminEmail(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!adminEmail && !!email && email.trim().toLowerCase() === adminEmail;
}

/**
 * The logged-in admin, or null if nobody (or someone else) is logged in.
 * `needsCode` is true when two-step login is on but this session hasn't
 * entered the 6-digit code yet.
 */
export async function getAdmin() {
  // Supabase reads the current time (Date.now) when the client is created and
  // when it checks the token's expiry. io() tells Next.js that's intended:
  // this runs per request, never ahead of time. It must come first.
  await io();
  const supabase = await createClient();
  // getClaims verifies the login token's signature, so it can't be faked.
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;
  if (!isAdminEmail(email)) return null;

  // "aal2" = this session passed the 2FA code; nextLevel "aal2" = 2FA is on
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const needsCode = aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2";
  return { email: email as string, supabase, needsCode };
}

/**
 * Call at the top of every admin page and admin server action.
 * Sends anyone who isn't the admin to the login page, and an admin who
 * hasn't entered their 2FA code yet to the code page.
 */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  if (admin.needsCode) redirect("/admin/login/code");
  return admin;
}
