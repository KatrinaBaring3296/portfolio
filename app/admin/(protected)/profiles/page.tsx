import { ProfilesManager } from "@/components/admin/profiles-manager";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { FocusProfile, ServiceCategory } from "@/lib/types";

export const metadata = { title: "Profiles" };

export default async function ProfilesPage() {
  const { supabase } = await requireAdmin();
  const [profiles, categories, settings] = await Promise.all([
    supabase.from("focus_profiles").select("*").order("sort_order"),
    supabase.from("service_categories").select("*").order("sort_order"),
    supabase.from("site_settings").select("default_profile_id").eq("id", 1).maybeSingle(),
  ]);
  if (profiles.error) throw new Error(profiles.error.message);

  return (
    <>
      <PageHeader
        title="Profiles"
        description="One page per type of job you apply for. Send each employer the matching link."
      />
      <ProfilesManager
        profiles={profiles.data as FocusProfile[]}
        categories={(categories.data ?? []) as ServiceCategory[]}
        defaultProfileId={settings.data?.default_profile_id ?? null}
      />
    </>
  );
}
