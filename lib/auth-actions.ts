"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "./auth";
import { createClient } from "./supabase/server";

export type LoginState = { error: string; email?: string };

// Log in with email + password. Only the ADMIN_EMAIL account may stay logged in.
export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password.", email };
  }

  // Same message for "not the admin" and "wrong password", so the login
  // page never reveals which email is the admin's.
  const failed: LoginState = { error: "Incorrect email or password.", email };

  if (!isAdminEmail(email)) return failed;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase limits repeated attempts; tell the person to wait in that case
    if (error.status === 429) {
      return { error: "Too many attempts. Please wait a few minutes and try again.", email };
    }
    return failed;
  }
  if (!isAdminEmail(data.user?.email)) {
    await supabase.auth.signOut();
    return failed;
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
