import { type RequestRow, TestimonialRequests } from "@/components/admin/testimonial-requests";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { SITE_URL } from "@/lib/seo";
import type { Testimonial } from "@/lib/types";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const { supabase } = await requireAdmin();
  const [testimonials, requests] = await Promise.all([
    supabase.from("testimonials").select("*").order("sort_order"),
    supabase
      .from("testimonial_requests")
      .select("id, token, name, created_at, used_at")
      .order("created_at", { ascending: false }),
  ]);
  if (testimonials.error) throw new Error(testimonials.error.message);

  // Before migration 0008 is run, the links table doesn't exist yet
  const tableMissing = requests.error?.code === "42P01" || requests.error?.code === "PGRST205";
  const requestRows: RequestRow[] = (requests.data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    url: `${SITE_URL}/review/${r.token}`,
    created_at: r.created_at,
    used_at: r.used_at,
  }));

  return (
    <>
      <PageHeader title="Testimonials" description="Feedback from clients or colleagues." />
      <TestimonialRequests requests={requestRows} tableMissing={tableMissing} />
      <TestimonialsManager items={testimonials.data as Testimonial[]} />
    </>
  );
}
