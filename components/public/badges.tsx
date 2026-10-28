// Small reusable labels.

export function ComingSoonBadge({ label = "Coming soon" }: { label?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      {label}
    </span>
  );
}

// Monospace chip for skills and tech-stack tags. Lights up on hover.
export function TechTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-xs transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary-tint">
      {children}
    </span>
  );
}
