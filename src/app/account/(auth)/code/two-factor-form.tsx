"use client";
import { useEffect, useRef, useState } from "react";
import { useBrowserValue } from "@/components/app/use-browser-value";
import { useRouter } from "next/navigation";
import { IconShieldCheck } from "@tabler/icons-react";
import { OtpInput, ResendCode } from "@/components/app/form";
import { Alert, IconTile } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { maskEmail } from "@/components/account/auth-ui";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export function TwoFactorForm() {
  const router = useRouter();
  const email = useBrowserValue(() => sessionStorage.getItem("fi-email") ?? "", "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || sessionStorage.getItem("fi-otp-sent")) return;
    sent.current = true;
    sessionStorage.setItem("fi-otp-sent", "1");
    authClient.twoFactor.sendOtp().then(({ error }) => {
      if (error) setError(authErrorMessage(error));
    });
  }, []);

  async function verify(value: string) {
    if (value.length !== 6) return;
    setPending(true);
    setError(null);
    const { data, error } = await authClient.twoFactor.verifyOtp({ code: value });
    if (error) {
      setPending(false);
      setError(authErrorMessage(error));
      return;
    }
    sessionStorage.removeItem("fi-otp-sent");
    const next = sessionStorage.getItem("fi-next");
    sessionStorage.removeItem("fi-next");
    const role = (data?.user as { role?: string } | undefined)?.role;
    router.replace(next ?? (role === "ADMIN" ? "/admin" : "/account"));
    router.refresh();
  }

  return (
    <form
      className="flex flex-1 flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        verify(String(new FormData(e.currentTarget).get("code") ?? ""));
      }}
    >
      <IconTile tone="flash" size={64} className="rounded-lg">
        <IconShieldCheck size={32} stroke={1.75} />
      </IconTile>
      <div>
        <h1 className="text-h2 m-0 mb-2">Code de vérification</h1>
        <p className="m-0 text-ink-muted">Saisissez le code à 6 chiffres envoyé par e-mail{email ? ` à ${maskEmail(email)}` : ""}.</p>
      </div>
      {error && <Alert tone="down" title={error} />}
      <OtpInput disabled={pending} onComplete={verify} />
      <ResendCode
        onResend={async () => {
          const { error } = await authClient.twoFactor.sendOtp();
          if (error) setError(authErrorMessage(error));
        }}
      />
      <div className="mt-auto pt-4 lg:mt-0">
        <Button type="submit" size="lg" block disabled={pending}>
          {pending ? "Vérification…" : "Valider"}
        </Button>
      </div>
    </form>
  );
}
