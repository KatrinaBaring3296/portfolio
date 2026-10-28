import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { FocusProfile, SiteSettings } from "@/lib/types";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const [settings, profiles] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("focus_profiles").select("id, label, status").order("sort_order"),
  ]);

  if (settings.error) throw new Error(settings.error.message);

  return (
    <>
      <PageHeader
        title="Site settings"
        description="Your name, photo, contact details, and other site-wide text."
      />
      <SettingsForm
        settings={settings.data as SiteSettings}
        profiles={(profiles.data ?? []) as Pick<FocusProfile, "id" | "label" | "status">[]}
      />
    </>
  );
}
