import type { ProfileOption } from "@/components/admin/show-for-picker";
import { SkillsManager } from "@/components/admin/skills-manager";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { skillLogo } from "@/lib/brand-icons";
import type { Skill } from "@/lib/types";

export const metadata = { title: "Skills" };

export default async function SkillsPage() {
  const { supabase } = await requireAdmin();
  const [skills, profiles] = await Promise.all([
    supabase.from("skills").select("*").order("sort_order"),
    supabase.from("focus_profiles").select("id, label, status").order("sort_order"),
  ]);
  if (skills.error) throw new Error(skills.error.message);

  // Each skill's current logo (looked up here so the logo library stays on the server)
  const logos = Object.fromEntries((skills.data as Skill[]).map((s) => [s.id, skillLogo(s)]));

  return (
    <>
      <PageHeader
        title="Skills & tools"
        description='Skills with a logo show as logo tiles under "Tools I use"; the rest show as chips.'
      />
      <SkillsManager
        skills={skills.data as Skill[]}
        logos={logos}
        profiles={(profiles.data ?? []) as ProfileOption[]}
      />
    </>
  );
}
