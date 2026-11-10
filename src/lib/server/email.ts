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

export type MailAttachment = { filename: string; content: Buffer };
export type OutgoingMail = { to: string; subject: string; html: string; text: string; attachments?: MailAttachment[] };

/** Envoi d'un message avec pièces jointes éventuelles. Renvoie un échec (retry sur limite de débit). */
export async function sendMail(m: OutgoingMail): Promise<boolean> {
  const resend = getResend();
  if (!resend || process.env.EMAIL_DEV_LOG === "1") {
    const att = m.attachments?.length ? `\n[email] Pièces jointes : ${m.attachments.map((a) => `${a.filename} (${a.content.length} o)`).join(", ")}` : "";
    console.info(`\n[email] À : ${m.to}\n[email] Objet : ${m.subject}${att}\n${m.text}\n`);
    return true;
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    const { error } = await resend.emails.send({ from: emailFrom(), to: m.to, subject: m.subject, html: m.html, text: m.text, attachments: m.attachments });
    if (!error) return true;
    const limited = (error as { statusCode?: number | null }).statusCode === 429 || /rate/i.test(error.message ?? "");
    if (!limited) {
      console.error("[email] échec de l'envoi", error);
      return false;
    }
    await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
  }
  return false;
}

/** Envoi par lots de 100 (sans pièces jointes) : un appel par lot, nettement plus rapide pour « tous les clients ». */
export async function sendMailBatch(mails: Omit<OutgoingMail, "attachments">[]): Promise<boolean[]> {
  const resend = getResend();
  if (!resend || process.env.EMAIL_DEV_LOG === "1") {
    for (const m of mails) console.info(`\n[email] À : ${m.to}\n[email] Objet : ${m.subject}\n${m.text}\n`);
    return mails.map(() => true);
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    const { error } = await resend.batch.send(mails.map((m) => ({ from: emailFrom(), to: m.to, subject: m.subject, html: m.html, text: m.text })));
    if (!error) return mails.map(() => true);
    const limited = (error as { statusCode?: number | null }).statusCode === 429 || /rate/i.test(error.message ?? "");
    if (!limited) {
      console.error("[email] échec du lot", error);
      return mails.map(() => false);
    }
    await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
  }
  return mails.map(() => false);
}
