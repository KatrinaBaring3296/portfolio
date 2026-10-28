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
      {/* A row of round category icons; tapping one shows only its services */}
      <div
        role="group"
        aria-label="Filter services"
        className="flex flex-wrap justify-center gap-x-6 gap-y-8 sm:gap-x-10"
      >
        <FilterCircle icon="Layers" active={selected === "all"} onClick={() => setSelected("all")}>
          Everything
        </FilterCircle>
        {categories.map((c) => (
          <FilterCircle key={c.id} icon={c.icon} active={selected === c.id} onClick={() => setSelected(c.id)}>
            {c.name}
          </FilterCircle>
        ))}
      </div>

      <div className="mt-14 space-y-12">
        {visibleCategories.map((category) => {
          const items = services.filter((s) => s.category_id === category.id);
          if (items.length === 0) return null;
          return (
            <div key={category.id}>
              <div className="flex flex-wrap items-center gap-3">
                <Icon name={category.icon} className="size-5 text-primary" />
                <h3 className="font-display text-xl font-bold">{category.name}</h3>
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
                      <div className="group h-full rounded-3xl border border-border bg-surface p-5 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
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

function FilterCircle({
  icon,
  active,
  onClick,
  children,
}: {
  icon: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="group flex w-28 flex-col items-center gap-3 text-center"
    >
      <span
        className={`inline-flex size-20 items-center justify-center rounded-full border-2 transition duration-300 group-hover:-translate-y-1 ${
          active
            ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30"
            : "border-border bg-surface text-primary-dark group-hover:border-primary"
        }`}
      >
        <Icon name={icon} className="size-9 stroke-[1.5]" />
      </span>
      <span className={`font-display text-sm leading-tight font-bold ${active ? "text-primary-dark" : ""}`}>
        {children}
      </span>
    </button>
  );
}
