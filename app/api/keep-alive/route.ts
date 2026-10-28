import { connection, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

// Vercel calls this once a day (see vercel.json "crons").
// Supabase's free plan pauses a project after about a week with no activity;
// this tiny daily read keeps it awake so the site never goes down on its own.
export async function GET() {
  await connection(); // always run for real, never cached
  const { error } = await createPublicClient().from("site_settings").select("id").limit(1);

  if (error) {
    console.error("Keep-alive check failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
