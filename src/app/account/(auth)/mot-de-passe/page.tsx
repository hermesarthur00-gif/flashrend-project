"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconRefresh } from "@tabler/icons-react";
import { AuthBack, AuthBody, maskEmail } from "@/components/account/auth-ui";
import { Field, OtpInput, ResendCode } from "@/components/app/form";
import { Alert, IconTile } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Mot de passe oublié · FlashInv";
  }, []);

  async function requestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("email")).trim().toLowerCase();
    setPending(true);
    setError(null);
    const { error } = await authClient.emailOtp.requestPasswordReset({ email: value });
    setPending(false);
    if (error) return setError(authErrorMessage(error));
    setEmail(value);
    setStep("reset");
  }

  async function reset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const otp = String(f.get("code") ?? "");
    const password = String(f.get("password"));
    if (otp.length !== 6) return setError("Saisissez le code à 6 chiffres.");
    if (password.length < 8 || !/\d/.test(password)) return setError("Le mot de passe doit contenir au moins 8 caractères, dont un chiffre.");
    setPending(true);
    setError(null);
    const { error } = await authClient.emailOtp.resetPassword({ email, otp, password });
    if (error) {
      setPending(false);
      return setError(authErrorMessage(error));
    }
    router.replace("/account/connexion?reinitialise=1");
  }

  return (
    <>
      <div className="lg:hidden">
        <AuthBack href="/account/connexion" />
      </div>
      <AuthBody>
        <IconTile size={64} className="rounded-lg">
          <IconRefresh size={32} stroke={1.75} />
        </IconTile>
        {step === "email" ? (
          <form onSubmit={requestCode} className="flex flex-1 flex-col gap-6">
            <div>
              <h1 className="text-h2 m-0 mb-2">Mot de passe oublié</h1>
              <p className="m-0 text-ink-muted">Indiquez votre adresse e-mail, nous vous envoyons un code pour en choisir un nouveau.</p>
            </div>
            {error && <Alert tone="down" title={error} />}
            <Field label="Adresse e-mail" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" required />
            <Alert tone="info" title="Code valable 10 minutes">
              Pensez à vérifier vos courriers indésirables.
            </Alert>
            <div className="mt-auto pt-4 lg:mt-0">
              <Button type="submit" size="lg" block disabled={pending}>
                {pending ? "Envoi…" : "Recevoir le code"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={reset} className="flex flex-1 flex-col gap-6">
            <div>
              <h1 className="text-h2 m-0 mb-2">Nouveau mot de passe</h1>
              <p className="m-0 text-ink-muted">Si un compte existe pour {maskEmail(email)}, un code vient d&apos;être envoyé.</p>
            </div>
            {error && <Alert tone="down" title={error} />}
            <OtpInput disabled={pending} />
            <ResendCode onResend={() => authClient.emailOtp.requestPasswordReset({ email })} />
            <Field label="Nouveau mot de passe" name="password" type="password" autoComplete="new-password" required minLength={8} hint="8 caractères minimum, dont un chiffre." />
            <div className="mt-auto pt-4 lg:mt-0">
              <Button type="submit" size="lg" block disabled={pending}>
                {pending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </form>
        )}
      </AuthBody>
    </>
  );
}
