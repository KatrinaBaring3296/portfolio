import { SamplesManager } from "@/components/admin/samples-manager";
import type { ProfileOption } from "@/components/admin/show-for-picker";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { WorkSample } from "@/lib/types";

export const metadata = { title: "Sample work" };

export default async function SamplesPage() {
  const { supabase } = await requireAdmin();
  const [samples, profiles, settings] = await Promise.all([
    supabase.from("work_samples").select("*").order("sort_order"),
    supabase.from("focus_profiles").select("id, label, status").order("sort_order"),
    supabase.from("site_settings").select("name").eq("id", 1).maybeSingle(),
  ]);

  // Before supabase/updates/0010_work_samples.sql is run, the table doesn't exist yet
  const tableMissing = samples.error?.code === "42P01" || samples.error?.code === "PGRST205";
  if (samples.error && !tableMissing) throw new Error(samples.error.message);

  return (
    <>
      <PageHeader
        title="Sample work"
        description="Examples of your work: a main description plus photos and PDFs, each with its own description."
      />
      <SamplesManager
        samples={(samples.data ?? []) as WorkSample[]}
        profiles={(profiles.data ?? []) as ProfileOption[]}
        ownerName={settings.data?.name ?? ""}
        tableMissing={tableMissing}
      />
    </>
  );
}
