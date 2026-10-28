import { ClipboardList, GraduationCap, Wrench } from "lucide-react";
import { skillLogo } from "@/lib/brand-icons";
import type { Skill, SkillLogo as Logo } from "@/lib/types";
import { TechTag } from "./badges";
import { Reveal } from "./reveal";
import { Section } from "./section";
import { SkillLogo } from "./skill-logo";

const GROUPS = [
  { key: "admin", title: "Admin / Office", Icon: ClipboardList },
  { key: "technical", title: "Teaching & Tech", Icon: GraduationCap },
] as const;

// Skills with a logo (tools like Gmail or Python) appear as logo tiles under
// "Tools I use"; the rest (abilities like "Email management") stay as chips.
export function Skills({ items, tinted }: { items: Skill[]; tinted: boolean }) {
  if (items.length === 0) return null;

  const withLogos = items.map((skill) => ({ skill, logo: skillLogo(skill) }));
  const tools = withLogos.filter((x): x is { skill: Skill; logo: Logo } => x.logo !== null);
  const abilities = withLogos.filter((x) => x.logo === null).map((x) => x.skill);

  return (
    <Section id="skills" eyebrow="Skills & tools" title="What I work with" tinted={tinted}>
      {tools.length > 0 && (
        <Reveal>
          <h3 className="flex items-center gap-2 font-semibold">
            <Wrench className="size-5 text-primary" aria-hidden />
            Tools I use
          </h3>
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {tools.map(({ skill, logo }, i) => (
              // The li cascades in; the inner div lifts on hover
              <li key={skill.id} className="stagger-child" style={{ "--i": i } as React.CSSProperties}>
                <ToolTile name={skill.name} logo={logo} />
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {abilities.length > 0 && (
        <div className={`grid gap-6 md:grid-cols-2 ${tools.length > 0 ? "mt-10" : ""}`}>
          {GROUPS.map(({ key, title, Icon }, i) => {
            const groupSkills = abilities.filter((s) => s.skill_group === key);
            if (groupSkills.length === 0) return null;
            return (
              <Reveal key={key} delay={i * 100}>
                <div className="h-full rounded-2xl border border-border bg-surface p-6">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <Icon className="size-5 text-primary" aria-hidden />
                    {title}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {/* Chips pop in one after another once the card scrolls into view */}
                    {groupSkills.map((skill, j) => (
                      <li
                        key={skill.id}
                        className="stagger-child"
                        style={{ "--i": j } as React.CSSProperties}
                      >
                        <TechTag>{skill.name}</TechTag>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// One logo tile. Its glow and hover border use the tool's own brand color.
function ToolTile({ name, logo }: { name: string; logo: Logo }) {
  const brand = logo.kind === "brand" ? logo.color : "var(--primary)";
  return (
    <div
      style={{ "--brand": brand } as React.CSSProperties}
      className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-2 py-4 text-center transition duration-300 hover:-translate-y-1 hover:border-(--brand) hover:shadow-lg"
    >
      {/* Soft brand-tinted badge; in dark mode a light badge, like an app icon,
          so dark logos (C++, MySQL) stay visible in their real colors */}
      <span className="logo-badge inline-flex size-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] transition-transform duration-300 group-hover:scale-110 dark:bg-slate-100">
        <SkillLogo logo={logo} className="size-8" />
      </span>
      <span className="text-xs leading-tight font-medium sm:text-sm">{name}</span>
    </div>
  );
}
