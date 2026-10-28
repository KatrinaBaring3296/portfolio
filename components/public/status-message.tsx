import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// The big centered message used by the 404 and error pages.
export function StatusMessage({
  code,
  title,
  children,
  action,
}: {
  code: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode; // defaults to a "Back to home" link
}) {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-mono text-sm font-medium tracking-widest text-primary-dark">{code}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <div className="mt-4 text-muted">{children}</div>
      <div className="mt-8">
        {action ?? (
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to home
          </Link>
        )}
      </div>
    </div>
  );
}
