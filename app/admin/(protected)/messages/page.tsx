import { Inbox } from "lucide-react";
import Link from "next/link";
import { MarkAllReadButton, MessageItem, type MessageRow } from "@/components/admin/message-item";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const { supabase } = await requireAdmin();
  const { show } = await searchParams;
  const unreadOnly = show === "unread";

  let query = supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(200);
  if (unreadOnly) query = query.eq("is_read", false);

  const [messages, unread, profiles] = await Promise.all([
    query,
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("focus_profiles").select("slug, label"),
  ]);
  if (messages.error) throw new Error(messages.error.message);

  // Show "Customer Support" instead of "customer-support"
  const profileLabels = Object.fromEntries((profiles.data ?? []).map((p) => [p.slug, p.label]));
  const rows = (messages.data ?? []) as MessageRow[];
  const unreadCount = unread.count ?? 0;

  return (
    <>
      <PageHeader
        title="Messages"
        description="What visitors sent through your contact form."
        action={unreadCount > 0 ? <MarkAllReadButton /> : undefined}
      />

      <div className="mb-6 flex gap-2" role="group" aria-label="Filter messages">
        <FilterLink href="/admin/messages" active={!unreadOnly}>
          All
        </FilterLink>
        <FilterLink href="/admin/messages?show=unread" active={unreadOnly}>
          Unread ({unreadCount})
        </FilterLink>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          <Inbox className="mx-auto size-8" aria-hidden />
          <p className="mt-3">{unreadOnly ? "No unread messages." : "No messages yet."}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((m) => (
            <li key={m.id}>
              <MessageItem
                message={m}
                profileLabel={m.profile_slug ? profileLabels[m.profile_slug] : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
      }`}
    >
      {children}
    </Link>
  );
}
