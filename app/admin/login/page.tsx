import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "Log in" };

// If you're already logged in, proxy.ts sends you straight to /admin.
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-primary-tint px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-dark hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to site
          </Link>
          <ThemeToggle />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
            <LockKeyhole className="size-5" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Admin login</h1>
          <p className="mt-1 text-sm text-muted">Only the site owner can sign in here.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
