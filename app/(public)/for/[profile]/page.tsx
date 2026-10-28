import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { HomePage } from "@/components/public/home-page";
import { getProfile, getPublicProfiles, getSettings } from "@/lib/content";
import { profileMetadata } from "@/lib/seo";

// Pre-builds a page for each profile, e.g. /for/customer-support.
// Cache Components needs at least one entry, hence the placeholder fallback.
// Profiles added later are built on their first visit.
export async function generateStaticParams() {
  const profiles = await getPublicProfiles();
  return profiles.length > 0 ? profiles.map((p) => ({ profile: p.slug })) : [{ profile: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/for/[profile]">): Promise<Metadata> {
  const { profile: slug } = await params;
  const [profile, defaultProfile, settings] = await Promise.all([
    getProfile(slug),
    getProfile(),
    getSettings(),
  ]);
  if (!profile) return {};
  return profileMetadata(profile, settings, profile.id === defaultProfile?.id);
}

export default async function ProfilePage({ params }: PageProps<"/for/[profile]">) {
  const { profile: slug } = await params;
  const [profile, defaultProfile] = await Promise.all([getProfile(slug), getProfile()]);
  if (!profile) notFound(); // unknown or hidden profile

  // The default profile's only address is "/". Old /for/ links to it
  // (e.g. /for/general-va) send visitors there instead of showing a copy.
  if (profile.id === defaultProfile?.id) permanentRedirect("/");

  return <HomePage profile={profile} />;
}
