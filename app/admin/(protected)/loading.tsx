// Shown instantly while an admin page loads (Next.js wraps each page in a
// Suspense boundary with this as the fallback). The sidebar stays visible.
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-9 w-56 animate-pulse rounded-lg bg-primary-tint" />
      <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-primary-tint" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
