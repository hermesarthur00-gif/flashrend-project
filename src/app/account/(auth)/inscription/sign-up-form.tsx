"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field } from "@/components/app/form";
import { Alert } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export function SignUpForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const firstName = String(f.get("firstName")).trim();
    const lastName = String(f.get("lastName")).trim();
    const email = String(f.get("email")).trim().toLowerCase();
    const phone = String(f.get("phone") ?? "").trim();
    const password = String(f.get("password"));
    if (!/\d/.test(password) || password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères, dont un chiffre.");
      return;
    }
    setPending(true);
    setError(null);
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      phone: phone || undefined,
    });
    if (error) {
      setPending(false);
      setError(authErrorMessage(error));
      return;
    }
    sessionStorage.setItem("fi-email", email);
    router.push("/account/confirmer-email");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-3.5">
      {error && <Alert tone="down" title={error} />}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" name="firstName" autoComplete="given-name" required maxLength={60} />
        <Field label="Nom" name="lastName" autoComplete="family-name" required maxLength={60} />
      </div>
      <Field label="Adresse e-mail" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" required />
      <Field label="Téléphone" name="phone" type="tel" autoComplete="tel" placeholder="+33 6 12 34 56 78" hint="Facultatif, pour vous joindre si besoin." />
      <Field label="Mot de passe" name="password" type="password" autoComplete="new-password" required minLength={8} hint="8 caractères minimum, dont un chiffre." />
      <label className="flex items-start gap-2.5 text-sm leading-5">
        <input type="checkbox" required className="mt-0 size-5 shrink-0 accent-ink" />
        <span>
          J&apos;accepte les{" "}
          <Link href="/conditions-generales" target="_blank" className="underline underline-offset-2">
            conditions générales
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" target="_blank" className="underline underline-offset-2">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
      <div className="mt-auto flex flex-col gap-3 pt-4 lg:mt-2">
        <Button type="submit" size="lg" block disabled={pending}>
          {pending ? "Création…" : "Créer mon compte"}
        </Button>
        <p className="m-0 text-center text-sm">
          Déjà client ?{" "}
          <Link href="/account/connexion" className="font-bold underline-offset-2 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </form>
  );
}
