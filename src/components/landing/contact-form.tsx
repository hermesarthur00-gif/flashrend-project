"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendContactMessage } from "@/app/(public)/contact/actions";
import { CONTACT_SUBJECTS, type ContactState } from "@/lib/contact";
import { cn } from "@/lib/utils";

const field =
  "h-11 w-full rounded-md border border-line-strong bg-surface-raised px-3 text-base text-ink placeholder:text-ink-muted hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:border-down";

const initial: ContactState = { status: "idle" };

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <span id={id} className="text-[13px] leading-[18px] font-medium text-down">
      {errors[0]}
    </span>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      if (state.message) toast.success(state.message);
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const e = state.errors ?? {};
  const v = state.status === "error" ? (state.values ?? {}) : {};

  return (
    <form ref={formRef} action={action} noValidate className="flex flex-col gap-4">
      {/* Champ piège pour les robots, invisible pour les visiteurs */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Site web
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Nom</span>
          <input name="name" defaultValue={v.name} autoComplete="name" required aria-invalid={!!e.name} aria-describedby={e.name ? "err-name" : undefined} className={field} />
          <FieldError id="err-name" errors={e.name} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Adresse e-mail</span>
          <input
            name="email"
            defaultValue={v.email}
            type="email"
            autoComplete="email"
            required
            placeholder="vous@exemple.com"
            aria-invalid={!!e.email}
            aria-describedby={e.email ? "err-email" : undefined}
            className={field}
          />
          <FieldError id="err-email" errors={e.email} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">Sujet</span>
        <select key={v.subject ?? "s"} name="subject" className={field} defaultValue={v.subject || CONTACT_SUBJECTS[0]}>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">Message</span>
        <textarea
          name="message"
          defaultValue={v.message}
          required
          rows={6}
          aria-invalid={!!e.message}
          aria-describedby={e.message ? "err-message" : undefined}
          className={cn(field, "h-auto py-2.5")}
        />
        <FieldError id="err-message" errors={e.message} />
      </label>
      <p className="text-caption m-0 text-ink-muted">Ne communiquez jamais votre mot de passe ni vos codes de vérification, même à notre équipe.</p>
      <Button type="submit" size="lg" disabled={pending} aria-busy={pending} className="self-start">
        {pending && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
        {pending ? "Envoi en cours" : "Envoyer le message"}
      </Button>
    </form>
  );
}
