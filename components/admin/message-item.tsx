"use client";

import { CheckCheck, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteMessage, markAllRead, setMessageRead } from "@/lib/admin/message-actions";
import type { ActionResult } from "@/lib/admin/shared";
import { ConfirmButton } from "./confirm-button";
import { useToast } from "./toast";
import { iconButtonClass, secondaryButtonClass } from "./ui";

export type MessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  profile_slug: string | null;
  is_read: boolean;
  created_at: string;
};

// "Oct 20, 2026, 3:04 PM" in Philippine time
const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

export function MessageItem({ message, profileLabel }: { message: MessageRow; profileLabel?: string }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await action();
      toast(result.message, result.ok ? "success" : "error");
    });

  // Opens a Gmail reply in a new tab (a mailto: link would open the computer's
  // default mail app, e.g. Outlook). Their message is quoted below your reply.
  const quoted = message.message.length > 1000 ? `${message.message.slice(0, 1000)}…` : message.message;
  const replyLink = `https://mail.google.com/mail/?${new URLSearchParams({
    view: "cm",
    fs: "1",
    to: message.email,
    su: "Re: your message on my portfolio",
    body: `\n\n---\n${message.name} wrote:\n${quoted.replace(/^/gm, "> ")}`,
  })}`;

  return (
    <article
      className={`rounded-2xl border bg-surface p-5 transition-opacity ${
        message.is_read ? "border-border" : "border-primary"
      } ${pending ? "opacity-60" : ""}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold">
            {!message.is_read && (
              <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
            )}
            {message.name}
          </p>
          <a
            href={replyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm break-all text-primary-dark hover:underline"
          >
            {message.email}
          </a>
          <p className="mt-1 text-xs text-muted">
            {dateFormat.format(new Date(message.created_at))}
            {message.profile_slug && <> · via {profileLabel ?? message.profile_slug} page</>}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <a
            href={replyLink}
            target="_blank"
            rel="noopener noreferrer"
            className={iconButtonClass}
            aria-label={`Reply to ${message.name}`}
            title="Reply"
          >
            <Reply className="size-4" aria-hidden />
          </a>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setMessageRead(message.id, !message.is_read))}
            className={iconButtonClass}
            aria-label={message.is_read ? "Mark as unread" : "Mark as read"}
            title={message.is_read ? "Mark as unread" : "Mark as read"}
          >
            {message.is_read ? (
              <Mail className="size-4" aria-hidden />
            ) : (
              <MailOpen className="size-4" aria-hidden />
            )}
          </button>
          <ConfirmButton
            title="Delete this message?"
            description={`The message from ${message.name} will be permanently deleted.`}
            onConfirm={() => run(() => deleteMessage(message.id))}
            disabled={pending}
            className={iconButtonClass}
          >
            <Trash2 className="size-4" aria-hidden />
            <span className="sr-only">Delete message</span>
          </ConfirmButton>
        </div>
      </header>

      <p className="mt-4 text-sm leading-relaxed break-words whitespace-pre-wrap">{message.message}</p>
    </article>
  );
}

export function MarkAllReadButton() {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await markAllRead();
          toast(result.message, result.ok ? "success" : "error");
        })
      }
      className={secondaryButtonClass}
    >
      <CheckCheck className="size-4" aria-hidden /> Mark all as read
    </button>
  );
}
