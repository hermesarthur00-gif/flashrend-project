"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

const SUBJECTS = ["Question générale", "Mon compte", "Dépôt ou retrait", "Partenariat", "Presse"];

const field =
  "h-11 w-full rounded-md border border-line-strong bg-surface-raised px-3 text-base text-ink placeholder:text-ink-muted hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/**
 * Formulaire de contact.
 * Pour l'instant il prépare un e-mail dans la messagerie du visiteur ;
 * il sera branché sur une action serveur quand le back-end sera en place.
 */
export function ContactForm() {
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? "");
    const message = String(data.get("message") ?? "").trim();
    if (!name || !email || !message) {
      setError("Renseignez votre nom, votre e-mail et votre message.");
      return;
    }
    setError(null);
    const body = `${message}\n\n${name}\n${email}`;
    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`[${subject}] ${name}`)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Nom</span>
          <input name="name" autoComplete="name" required className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Adresse e-mail</span>
          <input name="email" type="email" autoComplete="email" required placeholder="vous@exemple.com" className={field} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">Sujet</span>
        <select name="subject" className={field} defaultValue={SUBJECTS[0]}>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">Message</span>
        <textarea name="message" required rows={6} className={`${field} h-auto py-2.5`} />
      </label>
      {error && (
        <p role="alert" className="m-0 text-sm font-medium text-down">
          {error}
        </p>
      )}
      <p className="text-caption m-0 text-ink-muted">
        Ne communiquez jamais votre mot de passe ni vos codes de vérification, même à notre équipe.
      </p>
      <Button type="submit" size="lg" className="self-start">
        Envoyer le message
      </Button>
    </form>
  );
}
