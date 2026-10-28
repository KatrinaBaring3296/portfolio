"use server";

import { requireAdmin } from "@/lib/auth";
import { searchBrandIcons } from "@/lib/brand-icons";

// Search the logo library from the admin's logo picker. Runs on the server
// so the browser never downloads all ~3,400 logos.
export async function searchLogos(query: string) {
  await requireAdmin();
  return searchBrandIcons(query.slice(0, 50), 12);
}
