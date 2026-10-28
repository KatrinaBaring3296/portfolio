"use server";

import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { type ActionResult, dbError, ok } from "./shared";

// Messages aren't shown on the public site, so these only refresh the admin page.

export async function setMessageRead(id: string, isRead: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("messages").update({ is_read: isRead }).eq("id", id);
  if (error) return dbError("update the message", error);
  refresh();
  return ok(isRead ? "Marked as read." : "Marked as unread.");
}

export async function markAllRead(): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("messages").update({ is_read: true }).eq("is_read", false);
  if (error) return dbError("mark messages as read", error);
  refresh();
  return ok("All messages marked as read.");
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) return dbError("delete the message", error);
  refresh();
  return ok("Message deleted.");
}
