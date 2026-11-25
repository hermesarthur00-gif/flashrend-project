"use server";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit, requireAdmin } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { sendMail, type MailAttachment } from "@/lib/server/email";
import { broadcastEmail } from "@/lib/server/email-templates";
import { cleanEmailHtml, emailHtmlToText, hasContent } from "@/lib/server/html-email";
import { runBroadcast } from "@/lib/server/broadcast";
import { MAX_ATTACHMENTS_BYTES, MAX_ATTACHMENT_FILES as MAX_FILES } from "@/lib/mail-limits";

const BLOCKED = /\.(exe|bat|cmd|com|scr|msi|vbs|js|jar|ps1|sh|dll|apk|lnk)$/i;
const emailSchema = z.email();

export type MailState = { error?: string; ok?: string };
export type ClientHit = { id: string; name: string; email: string; reference: string | null };

function build(subject: string, rawHtml: string) {
  const bodyHtml = cleanEmailHtml(rawHtml);
  return { bodyHtml, mail: broadcastEmail({ subject, bodyHtml, bodyText: emailHtmlToText(bodyHtml) }), empty: !hasContent(bodyHtml) };
}

async function readFiles(form: FormData): Promise<{ error: string } | { files: MailAttachment[]; meta: { name: string; size: number }[] }> {
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) return { error: `${MAX_FILES} pièces jointes au maximum.` };
  const total = files.reduce((s, f) => s + f.size, 0);
  if (total > MAX_ATTACHMENTS_BYTES) return { error: "Les pièces jointes dépassent 4 Mo au total." };
  const bad = files.find((f) => BLOCKED.test(f.name));
  if (bad) return { error: `Le type de fichier de « ${bad.name} » n'est pas autorisé.` };
  const out: MailAttachment[] = [];
  for (const f of files) out.push({ filename: f.name.replace(/[\\/\r\n]/g, "_"), content: Buffer.from(await f.arrayBuffer()) });
  return { files: out, meta: files.map((f) => ({ name: f.name, size: f.size })) };
}

/** Aperçu fidèle : le message dans le gabarit FlashRend. */
export async function previewEmail(input: { subject: string; html: string }): Promise<{ html: string }> {
  await requireAdmin();
  return { html: build(input.subject.trim() || "(sans objet)", input.html).mail.html };
}

export async function searchClients(q: string): Promise<ClientHit[]> {
  await requireAdmin();
  const term = q.trim();
  if (term.length < 2) return [];
  const rows = await db.user.findMany({
    where: { suspendedAt: null, OR: [{ name: { contains: term, mode: "insensitive" } }, { email: { contains: term, mode: "insensitive" } }, { reference: { contains: term, mode: "insensitive" } }] },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, name: true, email: true, reference: true },
  });
  return rows;
}

/** Nombre de clients qui recevraient un envoi à tous. */
async function allClients() {
  return db.user.findMany({ where: { role: "CLIENT", suspendedAt: null, emailVerified: true }, select: { email: true } });
}
export async function countAllClients() {
  await requireAdmin();
  return db.user.count({ where: { role: "CLIENT", suspendedAt: null, emailVerified: true } });
}

/** Envoie le message à l'adresse de l'administrateur connecté, pour relecture. */
export async function sendTestEmail(_: MailState | undefined, form: FormData): Promise<MailState> {
  const admin = await requireAdmin();
  const subject = String(form.get("subject") ?? "").trim() || "(sans objet)";
  const { mail, empty } = build(`[Test] ${subject}`, String(form.get("html") ?? ""));
  if (empty) return { error: "Le message est vide." };
  const att = await readFiles(form);
  if ("error" in att) return { error: att.error };
  const ok = await sendMail({ to: admin.email, ...mail, attachments: att.files });
  return ok ? { ok: `Test envoyé à ${admin.email}` } : { error: "Le test n'a pas pu être envoyé." };
}

export async function sendBroadcast(_: MailState | undefined, form: FormData): Promise<MailState> {
  const admin = await requireAdmin();
  const audience = String(form.get("audience"));
  const subject = String(form.get("subject") ?? "").trim();
  if (subject.length < 3 || subject.length > 150) return { error: "Donnez un objet (3 à 150 caractères)." };
  const { bodyHtml, mail, empty } = build(subject, String(form.get("html") ?? ""));
  if (empty) return { error: "Le message est vide." };
  if (bodyHtml.length > 400_000) return { error: "Le message est trop long." };
  const att = await readFiles(form);
  if ("error" in att) return { error: att.error };

  let recipients: string[] = [];
  let kind: "ALL" | "USER" | "CUSTOM";
  let target: string | null = null;
  if (audience === "ALL") {
    kind = "ALL";
    recipients = (await allClients()).map((u) => u.email);
    target = "Tous les clients actifs";
  } else if (audience === "USER") {
    kind = "USER";
    const user = await db.user.findUnique({ where: { id: String(form.get("userId") ?? "") }, select: { email: true, name: true, suspendedAt: true } });
    if (!user || user.suspendedAt) return { error: "Choisissez un client actif." };
    recipients = [user.email];
    target = `${user.name} <${user.email}>`;
  } else if (audience === "CUSTOM") {
    kind = "CUSTOM";
    const list = [...new Set(String(form.get("emails") ?? "").split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];
    const invalid = list.find((e) => !emailSchema.safeParse(e).success);
    if (invalid) return { error: `Adresse invalide : ${invalid}` };
    if (list.length === 0) return { error: "Saisissez au moins une adresse e-mail." };
    if (list.length > 20) return { error: "20 adresses au maximum. Pour écrire à tous les clients, choisissez « Tous les clients »." };
    recipients = list;
    target = list.join(", ");
  } else return { error: "Choisissez les destinataires." };
  if (recipients.length === 0) return { error: "Aucun destinataire." };

  const created = await db.emailBroadcast.create({
    data: { authorId: admin.id, subject, bodyHtml, audience: kind, target, recipients: recipients.length, attachments: att.meta },
  });
  await audit(admin.id, "email.broadcast", { type: "email", id: created.id }, { audience: kind, recipients: recipients.length, subject, attachments: att.meta.length });
  // L'envoi continue en arrière-plan : la page n'attend pas la fin d'un envoi à tous les clients.
  after(() => runBroadcast({ id: created.id, recipients, mail, attachments: att.files }));
  revalidatePath("/admin/emails");
  return { ok: recipients.length > 1 ? `Envoi en cours à ${recipients.length} destinataires` : "E-mail envoyé" };
}
