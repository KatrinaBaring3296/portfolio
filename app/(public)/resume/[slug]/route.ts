import { connection, NextResponse } from "next/server";
import { getProfile } from "@/lib/content";
import { createPublicClient } from "@/lib/supabase/public";

// /resume/customer-support -> counts one download for that profile, then sends
// the visitor to the PDF. The "Download résumé" buttons link here, so the
// admin dashboard can show which résumés get downloaded.
export async function GET(request: Request, { params }: RouteContext<"/resume/[slug]">) {
  await connection(); // run on every visit (never cached), so each download is counted
  const { slug } = await params;

  const profile = await getProfile(slug);
  if (!profile?.resume_url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Count it, but never let counting stop the download
  const { error } = await createPublicClient()
    .from("resume_downloads")
    .insert({ profile_slug: profile.slug });
  if (error) console.error("Couldn't count résumé download:", error.message);

  return NextResponse.redirect(profile.resume_url);
}
