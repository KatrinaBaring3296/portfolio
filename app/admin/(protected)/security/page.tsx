import { SecuritySettings } from "@/components/admin/security-settings";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Security" };

export default async function SecurityPage() {
  const { supabase, email } = await requireAdmin();
  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp.find((f) => f.status === "verified") ?? null;

  return (
    <>
      <PageHeader title="Security" description="Protect your admin with two-step login." />
      <SecuritySettings
        email={email}
        factor={factor ? { id: factor.id, createdAt: factor.created_at } : null}
      />
    </>
  );
}
