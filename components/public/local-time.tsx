"use client";

import { Clock } from "lucide-react";
import { useSyncExternalStore } from "react";

// "It's 3:04 PM in Manila right now", updated every minute, so overseas
// clients can see the time-zone overlap at a glance.
// Shown only in the browser: the server can't know the time a visitor
// sees the page, so during the server render this returns nothing.

const manilaTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  hour: "numeric",
  minute: "2-digit",
});

// Re-check every 15 seconds, so the minute changes on time
function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, 15_000);
  return () => clearInterval(timer);
}

export function LocalTime({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () => manilaTime.format(new Date()),
    () => null,
  );
  if (!time) return null;

  return (
    <p className={`flex items-center gap-2 text-sm text-muted ${className}`}>
      <Clock className="size-4 text-primary" aria-hidden />
      <span>
        It&apos;s <span className="font-semibold text-foreground">{time}</span> in Manila right now (UTC+8)
      </span>
    </p>
  );
}
