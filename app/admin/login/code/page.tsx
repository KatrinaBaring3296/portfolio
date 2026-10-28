import { ShieldCheck } from "lucide-react";
import { CodeForm } from "@/components/admin/code-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/lib/auth-actions";

export const metadata = { title: "Enter code" };

// Second login step when two-step login (2FA) is on. You're sent here after
// your password; the admin stays locked until the code is correct.
export default function CodePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-primary-tint px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-end">
          <ThemeToggle />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Enter your code</h1>
          <p className="mt-1 text-sm text-muted">
            Open your authenticator app and type the 6-digit code for <strong>Portfolio admin</strong>.
          </p>
          <CodeForm />
          <form action={logout} className="mt-4 text-center">
            <button type="submit" className="text-sm font-medium text-primary-dark hover:underline">
              Cancel and log out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
