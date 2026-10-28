import { FaqsManager } from "@/components/admin/faqs-manager";
import type { ProfileOption } from "@/components/admin/show-for-picker";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Faq } from "@/lib/types";

export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const { supabase } = await requireAdmin();
  const [faqs, profiles] = await Promise.all([
    supabase.from("faqs").select("*").order("sort_order"),
    supabase.from("focus_profiles").select("id, label, status").order("sort_order"),
  ]);

  // Before migration 0009 is run, the table doesn't exist yet
  const tableMissing = faqs.error?.code === "42P01" || faqs.error?.code === "PGRST205";
  if (faqs.error && !tableMissing) throw new Error(faqs.error.message);

  return (
    <>
      <PageHeader
        title="FAQ"
        description="Questions clients often ask, answered once on your site. Shown as an expandable list."
      />
      <FaqsManager
        items={(faqs.data ?? []) as Faq[]}
        profiles={(profiles.data ?? []) as ProfileOption[]}
        tableMissing={tableMissing}
      />
    </>
  );
}
