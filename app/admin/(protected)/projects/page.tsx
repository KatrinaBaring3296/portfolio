import { ProjectsManager } from "@/components/admin/projects-manager";
import type { ProfileOption } from "@/components/admin/show-for-picker";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Project } from "@/lib/types";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { supabase } = await requireAdmin();
  const [projects, profiles] = await Promise.all([
    supabase.from("projects").select("*").order("sort_order"),
    supabase.from("focus_profiles").select("id, label, status").order("sort_order"),
  ]);
  if (projects.error) throw new Error(projects.error.message);

  return (
    <>
      <PageHeader title="Projects" description="Things you've built. Each one gets its own page." />
      <ProjectsManager
        projects={projects.data as Project[]}
        profiles={(profiles.data ?? []) as ProfileOption[]}
      />
    </>
  );
}
