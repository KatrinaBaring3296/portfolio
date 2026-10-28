import { ChartColumn, Download, ExternalLink, Inbox, Mail, UserRoundCog } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { StatusSelect } from "@/components/admin/row-controls";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();

  // Logged in as the admin, so RLS lets these read messages and hidden rows.
  const [unread, total, settings, profiles, categories, services] = await Promise.all([
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase
      .from("site_settings")
      .select("default_profile:focus_profiles(label, slug)")
      .eq("id", 1)
      .maybeSingle(),
    supabase.from("focus_profiles").select("id, label, slug, status").order("sort_order"),
    supabase.from("service_categories").select("id, name, status").order("sort_order"),
    supabase.from("services").select("id, category_id, title, status").order("sort_order"),
  ]);

  const defaultProfile = settings.data?.default_profile as { label: string; slug: string } | null | undefined;

  const downloads = await recentResumeDownloads(supabase);
  const downloadCounts: Record<string, number> = {};
  for (const d of downloads.data ?? [])
    downloadCounts[d.profile_slug] = (downloadCounts[d.profile_slug] ?? 0) + 1;
  const totalDownloads = (downloads.data ?? []).length;
  const profileLabel = (slug: string) =>
    (profiles.data ?? []).find((p) => (p as { slug?: string }).slug === slug)?.label ?? slug;

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-muted">An overview of your site.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Inbox className="size-5" aria-hidden />}
          label="Unread messages"
          value={unread.count ?? 0}
          href="/admin/messages?show=unread"
        />
        <StatCard
          icon={<Mail className="size-5" aria-hidden />}
          label="All messages"
          value={total.count ?? 0}
          href="/admin/messages"
        />
        <StatCard
          icon={<UserRoundCog className="size-5" aria-hidden />}
          label="Default profile (shown at /)"
          value={defaultProfile?.label ?? "Not set"}
          href="/admin/profiles"
        />
      </div>

      <h2 className="mt-12 text-xl font-bold">Visitors</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
              <Download className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-2xl font-bold">{downloads.error ? "–" : totalDownloads}</p>
              <p className="text-sm text-muted">Résumé downloads, last 30 days</p>
            </div>
          </div>
          {downloads.error ? (
            <p className="mt-4 text-xs text-muted">
              Run <code className="font-mono">supabase/setup.sql</code> to start counting.
            </p>
          ) : (
            totalDownloads > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm">
                {Object.entries(downloadCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([slug, count]) => (
                    <li key={slug} className="flex justify-between gap-3">
                      <span>{profileLabel(slug)}</span>
                      <span className="font-mono text-muted">{count}</span>
                    </li>
                  ))}
              </ul>
            )
          )}
        </section>
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
        >
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
            <ChartColumn className="size-5" aria-hidden />
          </span>
          <p className="mt-4 flex items-center gap-1.5 font-semibold">
            Page visits &amp; where visitors come from
            <ExternalLink className="size-3.5 text-muted" aria-hidden />
          </p>
          <p className="mt-1 text-sm text-muted">
            In Vercel: your portfolio project → <strong>Analytics</strong> tab. Shows visits per page (e.g.
            /for/online-tutor) and sources like LinkedIn or Upwork.
          </p>
        </a>
      </div>

      <h2 className="mt-12 text-xl font-bold">Quick status</h2>
      <p className="mt-1 text-sm text-muted">
        Show, hide, or mark things as coming soon. Changes go live right away.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <QuickList title="Profiles">
          {(profiles.data ?? []).map((p) => (
            <QuickRow key={p.id} label={p.label}>
              <StatusSelect
                table="focus_profiles"
                id={p.id}
                status={p.status}
                label={`Status of ${p.label}`}
              />
            </QuickRow>
          ))}
        </QuickList>

        <QuickList title="Services">
          {(categories.data ?? []).map((c) => (
            <li key={c.id}>
              <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-sm font-semibold">{c.name}</span>
                <StatusSelect
                  table="service_categories"
                  id={c.id}
                  status={c.status}
                  label={`Status of category ${c.name}`}
                />
              </div>
              <ul>
                {(services.data ?? [])
                  .filter((s) => s.category_id === c.id)
                  .map((s) => (
                    <QuickRow key={s.id} label={s.title} indent>
                      <StatusSelect
                        table="services"
                        id={s.id}
                        status={s.status}
                        label={`Status of ${s.title}`}
                      />
                    </QuickRow>
                  ))}
              </ul>
            </li>
          ))}
        </QuickList>
      </div>
    </>
  );
}

// Résumé downloads in the last 30 days (table from migration 0003)
async function recentResumeDownloads(supabase: SupabaseClient) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return supabase.from("resume_downloads").select("profile_slug").gte("created_at", since);
}

function QuickList({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="self-start overflow-hidden rounded-2xl border border-border bg-surface">
      <h3 className="border-b border-border px-4 py-3 font-semibold">{title}</h3>
      <ul className="divide-y divide-border">{children}</ul>
    </section>
  );
}

function QuickRow({
  label,
  indent,
  children,
}: {
  label: string;
  indent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className={`flex items-center justify-between gap-3 py-2 pr-4 ${indent ? "pl-8" : "pl-4"}`}>
      <span className="truncate text-sm">{label}</span>
      {children}
    </li>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
        {icon}
      </span>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </Link>
  );
}
