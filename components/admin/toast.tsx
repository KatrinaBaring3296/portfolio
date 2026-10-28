"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

// Small pop-up messages in the corner ("Saved", "Couldn't delete", ...).
// Wrap the admin in <ToastProvider>, then call `const toast = useToast()`
// and `toast("Saved")` or `toast("Something failed", "error")`.

type Toast = { id: number; message: string; kind: "success" | "error" };
type ShowToast = (message: string, kind?: Toast["kind"]) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ShowToast>(
    (message, kind = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, kind }]);
      setTimeout(() => dismiss(id), kind === "error" ? 7000 : 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-surface p-4 text-sm shadow-lg ${
              t.kind === "error" ? "border-red-300 dark:border-red-400" : "border-primary"
            }`}
          >
            {t.kind === "error" ? (
              <CircleAlert className="size-5 shrink-0 text-red-600 dark:text-red-300" aria-hidden />
            ) : (
              <CircleCheck className="size-5 shrink-0 text-primary" aria-hidden />
            )}
            <p className="flex-1 font-medium">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="text-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
