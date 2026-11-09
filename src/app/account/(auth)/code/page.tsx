import type { Metadata } from "next";
import { AuthBack, AuthBody } from "@/components/account/auth-ui";
import { TwoFactorForm } from "./two-factor-form";

export const metadata: Metadata = { title: "Code de vérification" };

export default function TwoFactorPage() {
  return (
    <>
      <div className="lg:hidden">
        <AuthBack href="/account/connexion" />
      </div>
      <AuthBody>
        <TwoFactorForm />
      </AuthBody>
    </>
  );
}
