import { ServicesManager } from "@/components/admin/services-manager";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Service, ServiceCategory } from "@/lib/types";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const { supabase } = await requireAdmin();
  const [categories, services] = await Promise.all([
    supabase.from("service_categories").select("*").order("sort_order"),
    supabase.from("services").select("*").order("sort_order"),
  ]);
  if (categories.error) throw new Error(categories.error.message);
  if (services.error) throw new Error(services.error.message);

  return (
    <>
      <PageHeader title="Services" description="What you offer, grouped by category." />
      <ServicesManager
        categories={categories.data as ServiceCategory[]}
        services={services.data as Service[]}
      />
    </>
  );
}
