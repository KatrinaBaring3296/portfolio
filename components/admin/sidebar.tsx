"use client";

import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/lib/auth-actions";
import { NAV_ITEMS } from "./nav-items";

// Left sidebar on desktop; a top bar with a slide-down menu on phones.
export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // "/admin" is active only on the dashboard itself; others match their sub-pages too
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");

  const nav = (
    <nav aria-label="Admin">
      <ul className="space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:bg-primary-tint hover:text-foreground"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const footer = (
    <div className="space-y-3 border-t border-border pt-4">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 text-sm font-medium text-primary-dark hover:underline"
      >
        View site <ExternalLink className="size-3.5" aria-hidden />
      </a>
      <p className="truncate px-3 text-xs text-muted" title={email}>
        {email}
      </p>
      <div className="flex items-center gap-2 px-1">
        <form action={logout} className="flex-1">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted transition-colors hover:bg-primary-tint hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden /> Log out
          </button>
        </form>
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-surface p-4 lg:flex">
        <Link href="/admin" className="px-3 pt-2 font-bold tracking-tight">
          Portfolio admin
        </Link>
        <div className="flex-1">{nav}</div>
        {footer}
      </aside>

      {/* Phones and tablets */}
      <div className="sticky top-0 z-40 border-b border-border bg-surface lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin" className="font-bold tracking-tight">
            Portfolio admin
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="admin-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
        {open && (
          <div id="admin-mobile-nav" className="space-y-4 border-t border-border p-4">
            {nav}
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
