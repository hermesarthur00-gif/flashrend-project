import "server-only";
import { Resend } from "resend";

/**
 * Envoi d'e-mails (contact et transactionnels) via Resend.
 * Variables d'environnement : RESEND_API_KEY, EMAIL_FROM.
 * Sans clé (développement), le message est écrit dans la console.
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

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  const resend = getResend();
  if (!resend || process.env.EMAIL_DEV_LOG === "1") {
    console.info(`\n[email] À : ${to}\n[email] Objet : ${subject}\n${text}\n`);
    return true;
  }
  const { error } = await resend.emails.send({ from: emailFrom(), to, subject, html, text });
  if (error) {
    console.error("[email] échec de l'envoi", error);
    return false;
  }
  return true;
}
