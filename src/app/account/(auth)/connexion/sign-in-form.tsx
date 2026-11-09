"use client";
import { useEffect, useState } from "react";
import { useBrowserValue } from "@/components/app/use-browser-value";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field } from "@/components/app/form";
import { Alert } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export function SignInForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const search = useBrowserValue(() => window.location.search, "");
  const params = new URLSearchParams(search);
  const [error, setError] = useState<string | null>(null);
  const shownError = error ?? (params.get("suspendu") ? "Ce compte est suspendu. Contactez le support." : null);
  const notice = params.get("reinitialise") ? "Mot de passe modifié. Connectez-vous avec le nouveau." : null;

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next?.startsWith("/")) sessionStorage.setItem("fi-next", next);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    setPending(true);
    setError(null);
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) {
      setPending(false);
      if (error.code === "EMAIL_NOT_VERIFIED") {
        sessionStorage.setItem("fi-email", email);
        await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
        router.push("/account/confirmer-email");
        return;
      }
      setError(authErrorMessage(error));
      return;
    }
    sessionStorage.setItem("fi-email", email);
    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
      sessionStorage.removeItem("fi-otp-sent");
      router.push("/account/code");
      return;
    }
    router.replace(sessionStorage.getItem("fi-next") ?? "/account");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4" noValidate={false}>
      {notice && <Alert tone="up" title={notice} />}
      {shownError && <Alert tone="down" title={shownError} />}
      <Field label="Adresse e-mail" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" required />
      <Field label="Mot de passe" name="password" type="password" autoComplete="current-password" required minLength={8} />
      <Link href="/account/mot-de-passe" className="self-end text-sm font-semibold underline-offset-2 hover:underline">
        Mot de passe oublié ?
      </Link>
      <div className="mt-auto flex flex-col gap-3 pt-4 lg:mt-2">
        <Button type="submit" size="lg" block disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
        <p className="m-0 text-center text-sm">
          Pas encore de compte ?{" "}
          <Link href="/account/inscription" className="font-bold underline-offset-2 hover:underline">
            Ouvrir un compte
          </Link>
        </p>
      </div>
    </form>
  );
}
