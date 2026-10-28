import { CategoriesManager } from "@/components/admin/categories-manager";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { ServiceCategory } from "@/lib/types";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const [categories, services] = await Promise.all([
    supabase.from("service_categories").select("*").order("sort_order"),
    supabase.from("services").select("category_id"),
  ]);
  if (categories.error) throw new Error(categories.error.message);

  // How many services each category has
  const serviceCounts: Record<string, number> = {};
  for (const s of services.data ?? []) serviceCounts[s.category_id] = (serviceCounts[s.category_id] ?? 0) + 1;

  return (
    <>
      <PageHeader
        title="Categories"
        description="Groups of services. The order here is the default order on your site."
      />
      <CategoriesManager categories={categories.data as ServiceCategory[]} serviceCounts={serviceCounts} />
    </>
  );
}
