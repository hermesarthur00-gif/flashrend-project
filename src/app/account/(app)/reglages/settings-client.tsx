"use client";
import { useActionState, useState } from "react";
import { useBrowserValue } from "@/components/app/use-browser-value";
import { IconBell, IconLock, IconLogout, IconMoon, IconPhone } from "@tabler/icons-react";
import { toast } from "sonner";
import { Field, SubmitButton, useActionToast } from "@/components/app/form";
import { IconTile } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { usePush } from "@/components/account/push";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { SignOutDialog } from "@/components/ui/sign-out";
import { cn } from "@/lib/utils";
import { updateContact } from "./actions";

export function ContactForm({ phone, email }: { phone: string; email: string }) {
  const [state, action] = useActionState(updateContact, undefined);
  useActionToast(state);
  return (
    <form action={action} className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center gap-3">
        <IconTile size={36}>
          <IconPhone size={20} stroke={1.75} />
        </IconTile>
        <p className="m-0 flex-1 text-sm text-ink-muted">
          E-mail : <strong className="text-ink">{email}</strong>. Pour le changer, contactez le support.
        </p>
      </div>
      <Field label="Téléphone" name="phone" type="tel" defaultValue={phone} placeholder="+33 6 12 34 56 78" autoComplete="tel" />
      <SubmitButton size="md" block={false} className="self-start" variant="secondary">
        Enregistrer
      </SubmitButton>
    </form>
  );
}

function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-45", checked ? "bg-ink" : "bg-line-strong")}
    >
      <span className={cn("absolute top-1 size-5 rounded-full transition-[left]", checked ? "left-6 bg-flash" : "left-1 bg-surface-raised")} />
    </button>
  );
}

export function PreferenceRows({ vapidKey }: { vapidKey: string }) {
  const push = usePush(vapidKey);
  const stored = useBrowserValue(() => localStorage.getItem("fi-theme") ?? "light", "light");
  const [chosen, setTheme] = useState<string | null>(null);
  const theme = chosen ?? stored;

  function applyTheme(t: string) {
    setTheme(t);
    localStorage.setItem("fi-theme", t);
    const resolved = t === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : t;
    document.documentElement.setAttribute("data-theme", resolved);
  }

  const pushNote = push.state === "unsupported" ? "Non disponible sur ce navigateur. Sur iPhone, ajoutez d'abord l'app à l'écran d'accueil." : push.state === "denied" ? "Bloquées dans les réglages du navigateur." : "Virements reçus, retraits envoyés, ajustements.";

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <IconTile size={36}>
          <IconBell size={20} stroke={1.75} />
        </IconTile>
        <span className="flex flex-1 flex-col">
          <span className="text-[15px] font-semibold">Notifications sur cet appareil</span>
          <span className="text-sm text-ink-muted">{pushNote}</span>
        </span>
        <Switch label="Notifications push" checked={push.subscribed} disabled={push.state === "unsupported" || push.state === "denied" || push.state === "loading"} onChange={(v) => (v ? push.enable() : push.disable())} />
      </div>
      <div className="flex items-center gap-3 border-t border-line px-4 py-3.5">
        <IconTile size={36}>
          <IconMoon size={20} stroke={1.75} />
        </IconTile>
        <span className="flex-1 text-[15px] font-semibold">Apparence</span>
        <div role="radiogroup" aria-label="Apparence" className="flex rounded-md bg-surface-sunken p-0.5">
          {[
            ["light", "Clair"],
            ["dark", "Sombre"],
            ["system", "Auto"],
          ].map(([k, l]) => (
            <button key={k} type="button" role="radio" aria-checked={theme === k} onClick={() => applyTheme(k)} className={cn("h-8 rounded-sm px-2.5 text-sm font-semibold", theme === k ? "bg-surface-raised text-ink" : "text-ink-muted")}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function PasswordForm() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center gap-3 border-t border-line px-4 py-3.5 text-left text-ink hover:bg-surface-sunken">
        <IconTile size={36}>
          <IconLock size={20} stroke={1.75} />
        </IconTile>
        <span className="flex-1 text-[15px] font-semibold">Changer le mot de passe</span>
      </button>
    );
  return (
    <form
      className="flex flex-col gap-3 border-t border-line px-4 py-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const newPassword = String(f.get("new"));
        if (newPassword.length < 8 || !/\d/.test(newPassword)) return toast.error("8 caractères minimum, dont un chiffre.");
        setPending(true);
        const { error } = await authClient.changePassword({ currentPassword: String(f.get("current")), newPassword, revokeOtherSessions: true });
        setPending(false);
        if (error) return toast.error(error.code === "INVALID_PASSWORD" ? "Mot de passe actuel incorrect." : authErrorMessage(error));
        toast.success("Mot de passe modifié. Vos autres appareils ont été déconnectés.");
        setOpen(false);
      }}
    >
      <Field label="Mot de passe actuel" name="current" type="password" autoComplete="current-password" required />
      <Field label="Nouveau mot de passe" name="new" type="password" autoComplete="new-password" required minLength={8} hint="8 caractères minimum, dont un chiffre." />
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

export function SignOutButton({ name }: { name?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" size="lg" block className="text-down" onClick={() => setOpen(true)}>
        <IconLogout size={20} stroke={1.75} /> Se déconnecter
      </Button>
      <SignOutDialog open={open} onClose={() => setOpen(false)} name={name} />
    </>
  );
}
