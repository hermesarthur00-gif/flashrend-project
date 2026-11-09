"use client";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient, inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/server/auth";

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), twoFactorClient(), inferAdditionalFields<typeof auth>()],
});

/** Messages d'erreur Better Auth traduits pour l'interface. */
export function authErrorMessage(error: { code?: string; message?: string; status?: number } | null | undefined) {
  if (!error) return "Une erreur est survenue. Réessayez.";
  const map: Record<string, string> = {
    INVALID_EMAIL_OR_PASSWORD: "E-mail ou mot de passe incorrect.",
    USER_ALREADY_EXISTS: "Un compte existe déjà avec cet e-mail.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cet e-mail.",
    EMAIL_NOT_VERIFIED: "Votre adresse e-mail n'est pas encore confirmée.",
    INVALID_OTP: "Code incorrect. Vérifiez et réessayez.",
    INVALID_CODE: "Code incorrect. Vérifiez et réessayez.",
    OTP_EXPIRED: "Ce code a expiré. Demandez-en un nouveau.",
    TOO_MANY_ATTEMPTS: "Trop d'essais. Demandez un nouveau code.",
    PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 8 caractères.",
    INVALID_TWO_FACTOR_COOKIE: "La session a expiré. Reconnectez-vous.",
    // Seul refus de session prévu : compte banni (voir databaseHooks dans auth.ts).
    FAILED_TO_CREATE_SESSION: "Ce compte est suspendu. Contactez le support.",
  };
  if (error.status === 429) return "Trop de tentatives. Patientez une minute.";
  if (error.status === 403 && !error.code) return "Ce compte est suspendu. Contactez le support.";
  return (error.code && map[error.code]) || "Une erreur est survenue. Réessayez.";
}
