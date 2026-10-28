"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { getProfile } from "./content";
import { emailNewMessage } from "./notify";
import { createPublicClient } from "./supabase/public";
import { type ContactErrors, type ContactInput, validateContact } from "./validation";

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: ContactErrors;
  values?: ContactInput; // sent back on errors so the form keeps what was typed
};

const SUCCESS: ContactState = {
  status: "success",
  message: "Thanks! Your message was sent. I'll get back to you soon.",
};

// Runs on the server when the contact form is submitted.
export async function sendMessage(_previous: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: real people never see this field, so if it's filled in, it's a bot.
  // Pretend it worked so the bot doesn't learn anything.
  if (String(formData.get("website") ?? "") !== "") return SUCCESS;

  const values: ContactInput = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };

  // Check again here: browser checks can be skipped by anyone.
  const errors = validateContact(values);
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please fix the highlighted fields.", errors, values };
  }

  // Scramble the visitor's IP so the database can rate-limit without storing the real address.
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";
  const ipHash = createHash("sha256").update(`portfolio-contact:${ip}`).digest("hex");

  const profileSlug = String(formData.get("profile_slug") ?? "").slice(0, 100) || null;

  const { error } = await createPublicClient().from("messages").insert({
    name: values.name,
    email: values.email,
    message: values.message,
    profile_slug: profileSlug,
    ip_hash: ipHash,
  });

  if (error) {
    if (error.message.includes("rate_limited")) {
      return {
        status: "error",
        message: "You've sent a few messages already. Please wait a few minutes, or email me directly.",
        values,
      };
    }
    console.error("Contact form insert failed:", error.message);
    return {
      status: "error",
      message: "Something went wrong. Please try again or email me directly.",
      values,
    };
  }

  // Email me about it, after the visitor already sees "Message sent"
  // (so a slow or failed email never affects them).
  after(async () => {
    const profileLabel = profileSlug ? ((await getProfile(profileSlug))?.label ?? profileSlug) : null;
    await emailNewMessage({ ...values, profileLabel });
  });

  return SUCCESS;
}
