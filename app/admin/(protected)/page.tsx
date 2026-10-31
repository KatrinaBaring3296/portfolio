import { ChartColumn, Download, ExternalLink, Inbox, Mail, UserRoundCog } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { StatusSelect } from "@/components/admin/row-controls";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Dashboard" };

// Time ranges for the résumé download count (?downloads=... in the URL)
const PERIODS = {
  day: { tab: "Today", label: "today (Manila time)" },
  week: { tab: "Week", label: "last 7 days" },
  month: { tab: "Month", label: "last 30 days" },
  year: { tab: "Year", label: "last 12 months" },
  all: { tab: "All time", label: "all time" },
} as const;
type Period = keyof typeof PERIODS;

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const { supabase } = await requireAdmin();
  const { downloads: downloadsParam } = await searchParams;
  const period: Period =
    typeof downloadsParam === "string" && downloadsParam in PERIODS ? (downloadsParam as Period) : "month";

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

  const downloads = await resumeDownloadCounts(
    supabase,
    (profiles.data ?? []).map((p) => ({ slug: p.slug, label: p.label })),
    period,
  );

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
        <section id="downloads" className="scroll-mt-24 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
              <Download className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-2xl font-bold">{downloads.error ? "–" : downloads.total}</p>
              <p className="text-sm text-muted">Résumé downloads, {PERIODS[period].label}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Time range">
            {(Object.keys(PERIODS) as Period[]).map((key) => (
              <Link
                key={key}
                href={key === "month" ? "/admin#downloads" : `/admin?downloads=${key}#downloads`}
                scroll={false}
                aria-current={key === period ? "page" : undefined}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  key === period
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                }`}
              >
                {PERIODS[key].tab}
              </Link>
            ))}
          </div>
          {downloads.error ? (
            <p className="mt-4 text-xs text-muted">
              Run <code className="font-mono">supabase/setup.sql</code> to start counting.
            </p>
          ) : (
            downloads.total > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm">
                {downloads.rows.map(({ label, count }) => (
                  <li key={label} className="flex justify-between gap-3">
                    <span>{label}</span>
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

// Start of the time range, or null for all time. "Today" starts at midnight
// in Manila (UTC+8, no daylight saving).
function periodStart(period: Period): string | null {
  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  if (period === "day") {
    const MANILA = 8 * 60 * 60 * 1000;
    return new Date(Math.floor((now + MANILA) / DAY) * DAY - MANILA).toISOString();
  }
  if (period === "week") return new Date(now - 7 * DAY).toISOString();
  if (period === "month") return new Date(now - 30 * DAY).toISOString();
  if (period === "year") return new Date(now - 365 * DAY).toISOString();
  return null;
}

// Résumé downloads in the time range, per profile, most downloaded first
// (table from migration 0003). Uses counts instead of fetching every row, so
// "All time" stays fast and accurate however many downloads there are.
async function resumeDownloadCounts(
  supabase: SupabaseClient,
  profiles: { slug: string; label: string }[],
  period: Period,
) {
  const since = periodStart(period);
  const count = (slug?: string) => {
    let query = supabase.from("resume_downloads").select("*", { count: "exact", head: true });
    if (since) query = query.gte("created_at", since);
    if (slug) query = query.eq("profile_slug", slug);
    return query;
  };
  const [total, ...perProfile] = await Promise.all([count(), ...profiles.map((p) => count(p.slug))]);
  if (total.error) return { error: total.error, total: 0, rows: [] };

  const rows = profiles
    .map((p, i) => ({ label: p.label, count: perProfile[i].count ?? 0 }))
    .filter((r) => r.count > 0);
  // Downloads from profiles that were since deleted or renamed
  const other = (total.count ?? 0) - rows.reduce((sum, r) => sum + r.count, 0);
  if (other > 0) rows.push({ label: "Other (deleted profiles)", count: other });
  return { error: null, total: total.count ?? 0, rows: rows.sort((a, b) => b.count - a.count) };
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
