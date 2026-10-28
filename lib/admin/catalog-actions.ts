"use server";

import { ICONS } from "@/components/public/icon";
import { requireAdmin } from "@/lib/auth";
import type { Status } from "@/lib/types";
import {
  type ActionResult,
  contentChanged,
  dbError,
  fail,
  nextSortOrder,
  ok,
  SLUG_PATTERN,
  slugify,
  UUID_PATTERN,
} from "./shared";

// Save (create or update) service categories and services.

const STATUSES: Status[] = ["active", "coming_soon", "hidden"];

export type CategoryInput = {
  id?: string; // missing = new category
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: Status;
};

export async function saveCategory(input: CategoryInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const name = input.name.trim();
  const slug = input.slug.trim() || slugify(name);
  if (!name || name.length > 80) return fail("Name is required (80 characters max).");
  if (!SLUG_PATTERN.test(slug)) return fail("Slug can only use lowercase letters, numbers, and dashes.");
  if (input.description.length > 300) return fail("Description is too long (300 max).");
  if (!(input.icon in ICONS)) return fail("Please pick an icon from the list.");
  if (!STATUSES.includes(input.status)) return fail("Invalid status.");
  if (input.id && !UUID_PATTERN.test(input.id)) return fail("Invalid request.");

  const values = {
    name,
    slug,
    description: input.description.trim(),
    icon: input.icon,
    status: input.status,
  };

  const { error } = input.id
    ? await supabase.from("service_categories").update(values).eq("id", input.id)
    : await supabase
        .from("service_categories")
        .insert({ ...values, sort_order: await nextSortOrder(supabase, "service_categories") });
  if (error) return dbError("save the category", error);

  contentChanged();
  return ok(input.id ? "Category saved." : "Category added.");
}

export type ServiceInput = {
  id?: string;
  category_id: string;
  title: string;
  description: string;
  icon: string;
  status: Status;
};

export async function saveService(input: ServiceInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const title = input.title.trim();
  if (!title || title.length > 80) return fail("Title is required (80 characters max).");
  if (input.description.length > 200) return fail("Keep the description to one line (200 max).");
  if (!UUID_PATTERN.test(input.category_id)) return fail("Please choose a category.");
  if (!(input.icon in ICONS)) return fail("Please pick an icon from the list.");
  if (!STATUSES.includes(input.status)) return fail("Invalid status.");
  if (input.id && !UUID_PATTERN.test(input.id)) return fail("Invalid request.");

  const values = {
    category_id: input.category_id,
    title,
    description: input.description.trim(),
    icon: input.icon,
    status: input.status,
  };

  let error;
  if (input.id) {
    // Moved to another category? Put it at the bottom of that category's list.
    const { data: before } = await supabase
      .from("services")
      .select("category_id")
      .eq("id", input.id)
      .single();
    const moved = before && before.category_id !== input.category_id;
    ({ error } = await supabase
      .from("services")
      .update(
        moved
          ? {
              ...values,
              sort_order: await nextSortOrder(supabase, "services", {
                column: "category_id",
                value: input.category_id,
              }),
            }
          : values,
      )
      .eq("id", input.id));
  } else {
    ({ error } = await supabase.from("services").insert({
      ...values,
      sort_order: await nextSortOrder(supabase, "services", {
        column: "category_id",
        value: input.category_id,
      }),
    }));
  }
  if (error) return dbError("save the service", error);

  contentChanged();
  return ok(input.id ? "Service saved." : "Service added.");
}
