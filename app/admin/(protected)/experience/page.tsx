import { ExperienceManager } from "@/components/admin/experience-manager";
import type { ProfileOption } from "@/components/admin/show-for-picker";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Experience } from "@/lib/types";

export const metadata = { title: "Experience" };

export default async function ExperiencePage() {
  const { supabase } = await requireAdmin();
  const [experience, profiles, settings] = await Promise.all([
    supabase.from("experience").select("*").order("sort_order"),
    supabase.from("focus_profiles").select("id, label, status").order("sort_order"),
    supabase.from("site_settings").select("name").eq("id", 1).maybeSingle(),
  ]);
  if (experience.error) throw new Error(experience.error.message);

  return (
    <>
      <PageHeader title="Experience" description="Jobs, internships, and roles for your timeline." />
      <ExperienceManager
        items={experience.data as Experience[]}
        profiles={(profiles.data ?? []) as ProfileOption[]}
        ownerName={settings.data?.name ?? ""}
      />
    </>
  );
}
