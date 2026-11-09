export const CONTACT_SUBJECTS = ["Question générale", "Mon compte", "Dépôt ou retrait", "Partenariat", "Presse"] as const;

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "subject" | "message", string[]>>;
  submittedAt?: number;
  /** Valeurs saisies, renvoyées en cas d'erreur pour ne rien perdre. */
  values?: { name?: string; email?: string; subject?: string; message?: string };
};
