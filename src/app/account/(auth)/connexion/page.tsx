import type { Metadata } from "next";
import { AuthBand, AuthBody } from "@/components/account/auth-ui";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Connexion" };

export default function SignInPage() {
  return (
    <>
      <AuthBand title="Bon retour parmi nous" sub="Connectez-vous pour suivre vos placements." glyph="eth" />
      <AuthBody title="Connexion">
        <SignInForm />
      </AuthBody>
    </>
  );
}
