"use client";

import { LoaderCircle, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import { confirmMfaSetup, disableMfa, startMfaSetup } from "@/lib/mfa-actions";
import { ConfirmButton } from "./confirm-button";
import { useAction } from "./row-controls";
import { useToast } from "./toast";
import { Card, inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "Asia/Manila" });

// Turn two-step login (2FA) on or off.
export function SecuritySettings({
  email,
  factor,
}: {
  email: string;
  factor: { id: string; createdAt: string } | null;
}) {
  const toast = useToast();
  const { run, pending } = useAction();
  const [setup, setSetup] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [starting, setStarting] = useState(false);
  const [code, setCode] = useState("");

  if (factor) {
    return (
      <Card className="space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 size-6 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
          <div>
            <h2 className="font-semibold">Two-step login is on</h2>
            <p className="mt-1 text-sm text-muted">
              Since {dateFormat.format(new Date(factor.createdAt))}. Each login asks for your password and a
              code from your authenticator app. The database also refuses changes from sessions without the
              code.
            </p>
          </div>
        </div>
        <RecoveryNote email={email} />
        <ConfirmButton
          title="Turn off two-step login?"
          description="Your admin will be protected by your password only."
          confirmLabel="Turn off"
          onConfirm={() => run(() => disableMfa(factor.id))}
          disabled={pending}
          className={secondaryButtonClass}
        >
          Turn off two-step login
        </ConfirmButton>
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 size-6 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <div>
          <h2 className="font-semibold">Two-step login is off</h2>
          <p className="mt-1 text-sm text-muted">
            Right now, anyone with your password could get into your admin. With two-step login, they&apos;d
            also need the 6-digit code from your phone.
          </p>
        </div>
      </div>

      {!setup ? (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm">
            <Smartphone className="size-4 text-primary" aria-hidden />
            First, install a free authenticator app on your phone: <strong>
              Google Authenticator
            </strong> or <strong>Microsoft Authenticator</strong>.
          </p>
          <button
            type="button"
            disabled={starting}
            onClick={async () => {
              setStarting(true);
              const result = await startMfaSetup();
              setStarting(false);
              if (result.ok) setSetup(result);
              else toast(result.message, "error");
            }}
            className={primaryButtonClass}
          >
            {starting && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            Turn on two-step login
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>
              In your authenticator app, tap <strong>+</strong> → <strong>Scan a QR code</strong>.
            </li>
            <li>Scan the code below.</li>
            <li>
              Type the 6-digit code the app shows, then click <strong>Confirm</strong>.
            </li>
          </ol>
          <div className="flex flex-wrap items-center gap-5">
            {/* Supabase gives the QR code as an image data URL */}
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL, not a remote image */}
            <img
              src={setup.qrCode}
              alt="QR code for your authenticator app"
              className="size-44 rounded-xl bg-white p-2"
            />
            <div className="min-w-0 flex-1 text-xs text-muted">
              <p>Can&apos;t scan? Choose &quot;Enter a setup key&quot; in the app and type:</p>
              <code className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm break-all text-foreground">
                {setup.secret}
              </code>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                const result = await confirmMfaSetup(setup.factorId, code.replace(/\s/g, ""));
                if (result.ok) setSetup(null);
                return result;
              });
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <div>
              <label htmlFor="setup-code" className="text-xs font-semibold">
                6-digit code
              </label>
              <input
                id="setup-code"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={7}
                placeholder="123 456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`${inputClass} w-40 font-mono tracking-widest`}
              />
            </div>
            <button type="submit" disabled={pending} className={primaryButtonClass}>
              {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              Confirm
            </button>
            <button type="button" onClick={() => setSetup(null)} className={secondaryButtonClass}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </Card>
  );
}

// What to do if the phone is lost
function RecoveryNote({ email }: { email: string }) {
  return (
    <details className="rounded-xl border border-border p-4 text-sm">
      <summary className="cursor-pointer font-semibold">Lost your phone? How to get back in</summary>
      <p className="mt-2 text-muted">
        In Supabase, open <strong>SQL Editor → New query</strong>, paste this, and click Run. It turns
        two-step login off, so you can log in with just your password and set it up again on your new phone:
      </p>
      <code className="mt-2 block rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs break-all">
        {`delete from auth.mfa_factors where user_id = (select id from auth.users where email = '${email}');`}
      </code>
      <p className="mt-2 text-xs text-muted">
        Tip: take a screenshot of this now and keep it somewhere safe.
      </p>
    </details>
  );
}
