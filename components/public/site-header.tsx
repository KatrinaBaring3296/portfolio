"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Work" },
  { href: "#skills", label: "Skills" },
];

export function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // On a homepage ("/" or "/for/..."), "#about" scrolls on the same page.
  // On other pages (like a project), the links go back to the main homepage.
  const onHomepage = pathname === "/" || pathname.startsWith("/for/");
  const base = onHomepage ? "" : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={onHomepage ? pathname : "/"}
          className="inline-flex items-center gap-2 font-display text-lg font-semibold [font-variation-settings:'SOFT'_100]"
        >
          <span className="size-2.5 rounded-full bg-primary" aria-hidden />
          {name}
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={base + item.href}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-primary-tint hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href={base + "#contact"}
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 sm:inline-flex"
          >
            Hire me
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border md:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border md:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {[...NAV, { href: "#contact", label: "Contact" }].map((item) => (
              <li key={item.href}>
                <a
                  href={base + item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 font-medium hover:bg-primary-tint"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
