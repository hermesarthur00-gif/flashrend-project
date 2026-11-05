import "server-only";
import { Resend } from "resend";

/**
 * Envoi d'e-mails (contact et transactionnels) via Resend.
 * Variables d'environnement : RESEND_API_KEY, EMAIL_FROM.
 */
let client: Resend | null = null;

export function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client ??= new Resend(key);
  return client;
}

export const emailFrom = () => process.env.EMAIL_FROM ?? "FlashInv <no-reply@flashinv.com>";

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
