/** Adresse attribuée à un compte supprimé (anonymisé). */
export const ANONYMIZED_DOMAIN = "supprime.flashinv.invalid";
export const isAnonymized = (email: string) => email.endsWith(`@${ANONYMIZED_DOMAIN}`);
