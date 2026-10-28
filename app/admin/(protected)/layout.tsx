import { Suspense } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { ToastProvider } from "@/components/admin/toast";
import { requireAdmin } from "@/lib/auth";

// The layout itself doesn't wait for the login check, so clicking between
// admin pages responds instantly. Instead, each part that needs the login
// checks it inside a loading boundary:
// - the sidebar (below), which shows your email
// - every admin page, which calls requireAdmin() before loading data
// proxy.ts has already turned away anyone who isn't the admin, and the
// database checks again on every read and write.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-dvh lg:flex">
        <Suspense fallback={<SidebarPlaceholder />}>
          <AdminSidebar />
        </Suspense>
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:py-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}

async function AdminSidebar() {
  const { email } = await requireAdmin();
  return <Sidebar email={email} />;
}

// Same size as the sidebar, so the page doesn't jump when it appears
function SidebarPlaceholder() {
  return (
    <>
      <div className="hidden h-dvh w-60 shrink-0 border-r border-border bg-surface lg:block" />
      <div className="h-14 border-b border-border bg-surface lg:hidden" />
    </>
  );
}
