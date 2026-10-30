import { EducationManager } from "@/components/admin/education-manager";
import type { ProfileOption } from "@/components/admin/show-for-picker";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Education } from "@/lib/types";

export const metadata = { title: "Education" };

export default async function EducationPage() {
  const { supabase } = await requireAdmin();
  const [education, profiles, settings] = await Promise.all([
    supabase.from("education").select("*").order("sort_order"),
    supabase.from("focus_profiles").select("id, label, status").order("sort_order"),
    supabase.from("site_settings").select("name").eq("id", 1).maybeSingle(),
  ]);

  // Before migration 0012 is run, the table doesn't exist yet
  const tableMissing = education.error?.code === "42P01" || education.error?.code === "PGRST205";
  if (education.error && !tableMissing) throw new Error(education.error.message);

  return (
    <>
      <PageHeader
        title="Education"
        description="Your schools, strands, and degrees, shown as their own section. Most recent first works best."
      />
      <EducationManager
        items={(education.data ?? []) as Education[]}
        profiles={(profiles.data ?? []) as ProfileOption[]}
        ownerName={settings.data?.name ?? ""}
        tableMissing={tableMissing}
      />
    </>
  );
}
