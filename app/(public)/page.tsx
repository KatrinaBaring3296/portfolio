import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/public/home-page";
import { getProfile, getSettings } from "@/lib/content";
import { profileMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);
  if (!profile) return {};
  return profileMetadata(profile, settings, true);
}

// "/" shows the default profile (chosen in the admin under Profiles or Site settings).
export default async function Home() {
  const profile = await getProfile();
  if (!profile) notFound();

  return <HomePage profile={profile} />;
}
