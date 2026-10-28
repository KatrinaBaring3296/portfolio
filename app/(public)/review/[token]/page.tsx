import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteImage } from "@/components/public/site-image";
import { StatusMessage } from "@/components/public/status-message";
import { TestimonialForm } from "@/components/public/testimonial-form";
import { getSettings } from "@/lib/content";
import { createPublicClient } from "@/lib/supabase/public";

// /review/<token>: the private, single-use page where someone you invited
// writes a testimonial. Links are created in Admin > Testimonials.
// Next.js needs one sample link to prebuild the page shell; real links are
// checked when opened. (The placeholder just shows "link expired".)
export async function generateStaticParams() {
  return [{ token: "__placeholder__" }];
}

export const metadata: Metadata = {
  title: "Leave a testimonial",
  robots: { index: false, follow: false }, // keep these private pages out of Google
};

export default function ReviewPage({ params }: PageProps<"/review/[token]">) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-primary-tint" />}>
        <ReviewContent params={params} />
      </Suspense>
    </div>
  );
}

async function ReviewContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [settings, request] = await Promise.all([getSettings(), findRequest(token)]);
  const firstName = settings.name.split(" ")[0] || settings.name;

  if (!request) {
    return (
      <StatusMessage code="Link expired" title="This link has already been used">
        <p>
          Each testimonial link works once. If you still want to leave a testimonial, ask {firstName} for a
          new link.
        </p>
      </StatusMessage>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        <SiteImage
          src={settings.photo_url}
          alt={settings.name}
          sizes="64px"
          variant="photo"
          placeholderLabel=""
          className="size-16 shrink-0 rounded-2xl border border-border"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hi {request.name.split(" ")[0]}!</h1>
          <p className="mt-1 text-muted">
            Thanks for taking a moment to write a testimonial for {settings.name}.
          </p>
        </div>
      </div>
      <TestimonialForm token={token} invitedName={request.name} ownerFirstName={firstName} />
    </>
  );
}

/** Who the link was sent to, or null if it's unknown or already used. */
async function findRequest(token: string) {
  if (token.length < 20 || token.length > 100) return null;
  const { data, error } = await createPublicClient().rpc("get_testimonial_request", { p_token: token });
  if (error) {
    console.error("Testimonial link lookup failed:", error.message);
    return null;
  }
  const row = (data as { name: string }[] | null)?.[0];
  return row ? { name: row.name } : null;
}
