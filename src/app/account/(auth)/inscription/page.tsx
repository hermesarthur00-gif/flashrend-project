import type { Metadata } from "next";
import { AuthBand, AuthBody } from "@/components/account/auth-ui";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Ouvrir un compte" };

export default function SignUpPage() {
  return (
    <>
      <AuthBand title="Ouvrez votre compte" sub="Deux minutes, puis on vérifie votre identité." />
      <AuthBody title="Ouvrir un compte">
        <SignUpForm />
      </AuthBody>
    </>
  );
}
