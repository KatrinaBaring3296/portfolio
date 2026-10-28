"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin, requireAdmin } from "./auth";

// Two-step login (2FA) with an authenticator app (Google Authenticator,
// Microsoft Authenticator, ...). Uses Supabase Auth's built-in, free TOTP support.

type Result = { ok: true; message: string } | { ok: false; message: string };
const CODE = /^\d{6}$/;

/** Step 1 of turning 2FA on: creates a QR code to scan. */
export async function startMfaSetup(): Promise<
  { ok: true; factorId: string; qrCode: string; secret: string } | { ok: false; message: string }
> {
  const { supabase } = await requireAdmin();

  // Remove half-finished setups from earlier attempts, so they don't pile up
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.factor_type === "totp" && f.status !== "verified")
      await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Portfolio admin ${new Date().toISOString().slice(0, 10)}`,
  });
  if (error || !data) {
    return { ok: false, message: `Couldn't start setup: ${error?.message ?? "unknown error"}` };
  }
  return { ok: true, factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

/** Step 2: the first code from the app confirms it's set up correctly. */
export async function confirmMfaSetup(factorId: string, code: string): Promise<Result> {
  if (!CODE.test(code)) return { ok: false, message: "Enter the 6-digit code from your app." };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error)
    return {
      ok: false,
      message: "That code didn't match. Check your phone's time is correct and try again.",
    };
  refresh();
  return { ok: true, message: "Two-step login is on. You'll be asked for a code each time you log in." };
}

/** Turns 2FA off (only possible from a session that already passed the code). */
export async function disableMfa(factorId: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) return { ok: false, message: `Couldn't turn it off: ${error.message}` };
  refresh();
  return { ok: true, message: "Two-step login is off." };
}

export type CodeState = { error: string };

/** At login: checks the 6-digit code, then continues to the admin. */
export async function verifyLoginCode(_previous: CodeState, formData: FormData): Promise<CodeState> {
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!CODE.test(code)) return { error: "Enter the 6-digit code from your authenticator app." };

  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  const { data: factors } = await admin.supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === "verified");
  if (!factor) redirect("/admin"); // 2FA isn't on; nothing to check

  const { error } = await admin.supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) {
    if (error.status === 429) return { error: "Too many attempts. Please wait a minute and try again." };
    return { error: "That code didn't match. Codes change every 30 seconds; try the current one." };
  }
  redirect("/admin");
}
