import { CertificatesManager } from "@/components/admin/certificates-manager";
import type { ProfileOption } from "@/components/admin/show-for-picker";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Certificate } from "@/lib/types";

export const metadata = { title: "Certifications" };

export default async function CertificatesPage() {
  const { supabase } = await requireAdmin();
  const [certificates, profiles, settings] = await Promise.all([
    supabase.from("certificates").select("*").order("sort_order"),
    supabase.from("focus_profiles").select("id, label, status").order("sort_order"),
    supabase.from("site_settings").select("name").eq("id", 1).maybeSingle(),
  ]);

  // Before supabase/setup.sql is run, the table doesn't exist yet
  const tableMissing = certificates.error?.code === "42P01" || certificates.error?.code === "PGRST205";
  if (certificates.error && !tableMissing) throw new Error(certificates.error.message);

  return (
    <>
      <PageHeader
        title="Certifications"
        description="Shown as view-only, watermarked previews with their details and verification links."
      />
      <CertificatesManager
        certificates={(certificates.data ?? []) as Certificate[]}
        profiles={(profiles.data ?? []) as ProfileOption[]}
        ownerName={settings.data?.name ?? ""}
        tableMissing={tableMissing}
      />
    </>
  );
}
