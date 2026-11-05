"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { IconCopy, IconCheck, IconEye, IconEyeOff } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FieldProps = React.ComponentProps<"input"> & { label: string; hint?: string; error?: string; suffix?: React.ReactNode };

export function Field({ label, hint, error, className, id, suffix, type, ...props }: FieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={fid} className="text-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={fid}
          type={isPassword && show ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${fid}-help` : undefined}
          className={cn(
            "h-12 w-full rounded-md border border-line-strong bg-surface-raised px-3.5 text-base text-ink outline-none placeholder:text-ink-muted/70 focus:border-ink focus:ring-2 focus:ring-ink/15 aria-invalid:border-down-fill",
            (isPassword || suffix) && "pr-12",
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-md text-ink-muted hover:text-ink"
          >
            {show ? <IconEyeOff size={20} stroke={1.75} /> : <IconEye size={20} stroke={1.75} />}
          </button>
        )}
        {suffix && !isPassword && <span className="absolute top-1/2 right-3.5 -translate-y-1/2 font-semibold text-ink-muted">{suffix}</span>}
      </div>
      {(error || hint) && (
        <p id={`${fid}-help`} className={cn("m-0 text-sm", error ? "text-down" : "text-ink-muted")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function SelectField({ label, children, hint, ...props }: React.ComponentProps<"select"> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label">
        {label}
      </label>
      <select id={id} className="h-12 w-full rounded-md border border-line-strong bg-surface-raised px-3 text-base text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/15" {...props}>
        {children}
      </select>
      {hint && <p className="m-0 text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, hint, ...props }: React.ComponentProps<"textarea"> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label">
        {label}
      </label>
      <textarea id={id} className="min-h-24 w-full rounded-md border border-line-strong bg-surface-raised px-3.5 py-3 text-base text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/15" {...props} />
      {hint && <p className="m-0 text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}

export function SubmitButton({ children, pendingLabel, ...props }: React.ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" block disabled={pending || props.disabled} aria-busy={pending} {...props}>
      {pending ? (pendingLabel ?? "Un instant…") : children}
    </Button>
  );
}

/** Saisie d'un code à 6 chiffres, collage accepté. */
export function OtpInput({ name = "code", length = 6, onComplete, autoFocus = true, disabled }: { name?: string; length?: number; onComplete?: (code: string) => void; autoFocus?: boolean; disabled?: boolean }) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const value = digits.join("");

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function set(i: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    if (!clean) {
      setDigits((d) => d.map((x, j) => (j === i ? "" : x)));
      return;
    }
    const next = [...digits];
    for (let k = 0; k < clean.length && i + k < length; k++) next[i + k] = clean[k];
    setDigits(next);
    const focus = Math.min(i + clean.length, length - 1);
    refs.current[focus]?.focus();
    const code = next.join("");
    if (code.length === length && !next.includes("")) onComplete?.(code);
  }

  return (
    <div className="flex gap-2" role="group" aria-label="Code de vérification">
      <input type="hidden" name={name} value={value} />
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Chiffre ${i + 1}`}
          maxLength={length}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          className="h-14 w-full min-w-0 rounded-md border border-line-strong bg-surface-raised text-center text-2xl font-bold tabular-nums text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/15"
        />
      ))}
    </div>
  );
}

/** Décompte avant de pouvoir redemander un code. */
export function ResendCode({ onResend, seconds = 45 }: { onResend: () => Promise<unknown> | void; seconds?: number }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  if (left > 0)
    return (
      <p className="m-0 text-sm text-ink-muted">
        Vous n&apos;avez rien reçu ? Nouveau code dans{" "}
        <strong className="text-ink tabular-nums">
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </strong>
      </p>
    );
  return (
    <button
      type="button"
      className="self-start text-sm font-semibold text-ink underline underline-offset-2"
      onClick={async () => {
        await onResend();
        setLeft(seconds);
      }}
    >
      Recevoir un nouveau code
    </button>
  );
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copier : ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          toast.success(`${label} copié`);
          setTimeout(() => setDone(false), 1600);
        } catch {
          toast.error("Copie impossible sur cet appareil.");
        }
      }}
      className="grid size-9 shrink-0 place-items-center rounded-md border border-current/20 hover:bg-ink/8"
    >
      {done ? <IconCheck size={18} stroke={2} /> : <IconCopy size={18} stroke={1.75} />}
    </button>
  );
}

/** Affiche le message renvoyé par une server action. */
export function useActionToast(state: { error?: string; ok?: string } | undefined) {
  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state?.ok) toast.success(state.ok);
  }, [state]);
}
