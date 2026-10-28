"use server";

import { after } from "next/server";
import { emailNewTestimonial } from "./notify";
import { createPublicClient } from "./supabase/public";
import { TESTIMONIAL_LIMITS } from "./testimonial-limits";

export type TestimonialFormState = {
  status: "idle" | "success" | "error";
  message: string;
  values?: { name: string; role: string; quote: string }; // kept on errors
};

// Runs when someone submits the form on their private /review/<token> link.
export async function submitTestimonial(
  _previous: TestimonialFormState,
  formData: FormData,
): Promise<TestimonialFormState> {
  const token = String(formData.get("token") ?? "");
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    quote: String(formData.get("quote") ?? "").trim(),
  };
  const fail = (message: string): TestimonialFormState => ({ status: "error", message, values });

  if (!values.name || values.name.length > TESTIMONIAL_LIMITS.name) return fail("Please enter your name.");
  if (values.role.length > TESTIMONIAL_LIMITS.role)
    return fail("Your role is a bit long; please shorten it.");
  if (values.quote.length < TESTIMONIAL_LIMITS.quoteMin) {
    return fail(`Please write at least ${TESTIMONIAL_LIMITS.quoteMin} characters.`);
  }
  if (values.quote.length > TESTIMONIAL_LIMITS.quoteMax) {
    return fail(`Please keep it under ${TESTIMONIAL_LIMITS.quoteMax} characters.`);
  }
  if (formData.get("consent") !== "on") {
    return fail("Please tick the box to agree that this can be shown on the portfolio.");
  }

  // The database checks the link is valid and unused, saves the testimonial
  // as Hidden, and marks the link as used, all in one step.
  const { error } = await createPublicClient().rpc("submit_testimonial", {
    p_token: token,
    p_name: values.name,
    p_role: values.role,
    p_quote: values.quote,
  });

  if (error) {
    if (error.message.includes("invalid_link")) {
      return fail("This link has already been used or is no longer valid.");
    }
    console.error("Testimonial submit failed:", error.message);
    return fail("Something went wrong. Please try again in a moment.");
  }

  after(() => emailNewTestimonial(values)); // tell the site owner, after the thank-you shows
  return { status: "success", message: "Thank you! Your testimonial was sent." };
}
