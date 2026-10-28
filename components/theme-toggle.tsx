"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  function toggle() {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Older browsers, or visitors who prefer less motion: switch instantly
    if (!document.startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }

    // Smooth crossfade: the browser snapshots the page, we switch the theme
    // class right away (next-themes would only apply it a moment later),
    // then the browser fades from the old look to the new one.
    document.startViewTransition(() => {
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
      setTheme(next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="group inline-flex size-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-primary-tint"
    >
      {/* Both icons are rendered and CSS shows the right one, so server and browser HTML match.
          They spin a little on hover. */}
      <Sun
        className="size-5 transition-transform duration-500 group-hover:rotate-45 dark:hidden"
        aria-hidden
      />
      <Moon
        className="hidden size-5 transition-transform duration-500 group-hover:-rotate-12 dark:block"
        aria-hidden
      />
    </button>
  );
}
