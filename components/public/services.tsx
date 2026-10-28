"use client";

import { useState } from "react";
import type { Service, ServiceCategory } from "@/lib/types";
import { ComingSoonBadge } from "./badges";
import { Icon } from "./icon";
import { Reveal } from "./reveal";
import { Section } from "./section";

// Client component because the filter chips need to react to clicks.
// Categories arrive already sorted (the profile's highlighted ones first).
export function Services({
  categories,
  services,
  tinted,
}: {
  categories: ServiceCategory[];
  services: Service[];
  tinted: boolean;
}) {
  const [selected, setSelected] = useState<string>("all");

  const visibleCategories = selected === "all" ? categories : categories.filter((c) => c.id === selected);

  return (
    <Section
      id="services"
      eyebrow="Services"
      title="How I can help"
      intro="Pick a category to see what's included."
      tinted={tinted}
    >
      <div role="group" aria-label="Filter services" className="flex flex-wrap gap-2">
        <FilterChip active={selected === "all"} onClick={() => setSelected("all")}>
          All
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c.id} active={selected === c.id} onClick={() => setSelected(c.id)}>
            {c.name}
          </FilterChip>
        ))}
      </div>

      <div className="mt-10 space-y-12">
        {visibleCategories.map((category) => {
          const items = services.filter((s) => s.category_id === category.id);
          if (items.length === 0) return null;
          return (
            <div key={category.id}>
              <div className="flex flex-wrap items-center gap-3">
                <Icon name={category.icon} className="size-5 text-primary" />
                <h3 className="text-lg font-semibold">{category.name}</h3>
                {category.status === "coming_soon" && <ComingSoonBadge />}
              </div>
              <p className="mt-1 text-sm text-muted">{category.description}</p>

              {/* Cards cascade in one after another (the li), and lift on hover (the inner div) */}
              <Reveal>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((service, i) => (
                    <li
                      key={service.id}
                      className="stagger-child"
                      style={{ "--i": i } as React.CSSProperties}
                    >
                      <div className="group h-full rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-tint text-primary-dark transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                            <Icon name={service.icon} className="size-5" />
                          </span>
                          {(service.status === "coming_soon" || category.status === "coming_soon") && (
                            <ComingSoonBadge />
                          )}
                        </div>
                        <h4 className="mt-4 font-semibold">{service.title}</h4>
                        <p className="mt-1 text-sm text-muted">{service.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}
