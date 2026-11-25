"use client";
import { useEffect, useState } from "react";
import { useBrowserValue } from "@/components/app/use-browser-value";
import { useRouter } from "next/navigation";
import { IconMail } from "@tabler/icons-react";
import { AuthBack, AuthBody, maskEmail } from "@/components/account/auth-ui";
import { OtpInput, ResendCode } from "@/components/app/form";
import { Alert, IconTile } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const email = useBrowserValue(() => sessionStorage.getItem("fi-email") ?? "", "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Confirmez votre e-mail · FlashRend";
    if (!sessionStorage.getItem("fi-email")) router.replace("/account/connexion");
  }, [router]);

  async function verify(otp: string) {
    if (otp.length !== 6 || !email) return;
    setPending(true);
    setError(null);
    const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
    if (error) {
      setPending(false);
      setError(authErrorMessage(error));
      return;
    }
    router.replace("/account/verification");
    router.refresh();
  }

  return (
    <>
      <div className="lg:hidden">
        <AuthBack href="/account/inscription" />
      </div>
      <AuthBody>
        <form
          className="flex flex-1 flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            verify(String(new FormData(e.currentTarget).get("code") ?? ""));
          }}
        >
          <IconTile tone="flash" size={64} className="rounded-lg">
            <IconMail size={32} stroke={1.75} />
          </IconTile>
          <div>
            <h1 className="text-h2 m-0 mb-2">Confirmez votre e-mail</h1>
            <p className="m-0 text-ink-muted">Saisissez le code à 6 chiffres envoyé à {email ? maskEmail(email) : "votre adresse"}. Pensez à regarder dans les courriers indésirables.</p>
          </div>
          {error && <Alert tone="down" title={error} />}
          <OtpInput disabled={pending} onComplete={verify} />
          <ResendCode
            onResend={async () => {
              const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
              if (error) setError(authErrorMessage(error));
            }}
          />
          <div className="mt-auto pt-4 lg:mt-0">
            <Button type="submit" size="lg" block disabled={pending}>
              {pending ? "Vérification…" : "Confirmer"}
            </Button>
          </div>
        </form>
      </AuthBody>
    </>
  );
}
