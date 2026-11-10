import "server-only";
import { db } from "./db";
import { sendMail, sendMailBatch, type MailAttachment } from "./email";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Envoie le message à chaque destinataire et tient les compteurs de l'historique à jour.
 * Sans pièce jointe : lots de 100. Avec pièces jointes : un envoi par destinataire, espacés pour respecter la limite de débit.
 */
export async function runBroadcast({ id, recipients, mail, attachments }: { id: string; recipients: string[]; mail: { subject: string; html: string; text: string }; attachments: MailAttachment[] }) {
  let sent = 0;
  let failed = 0;
  try {
    if (attachments.length === 0) {
      for (let i = 0; i < recipients.length; i += 100) {
        const chunk = recipients.slice(i, i + 100);
        const res = await sendMailBatch(chunk.map((to) => ({ to, ...mail })));
        for (const ok of res) {
          if (ok) sent++;
          else failed++;
        }
        await db.emailBroadcast.update({ where: { id }, data: { sent, failed } });
        if (i + 100 < recipients.length) await sleep(600);
      }
    } else {
      for (let i = 0; i < recipients.length; i++) {
        const ok = await sendMail({ to: recipients[i], ...mail, attachments });
        if (ok) sent++;
        else failed++;
        if (i % 5 === 4) await db.emailBroadcast.update({ where: { id }, data: { sent, failed } });
        if (i + 1 < recipients.length) await sleep(350);
      }
    }
  } catch (e) {
    console.error("[broadcast]", e);
    failed = recipients.length - sent;
  } finally {
    await db.emailBroadcast.update({ where: { id }, data: { sent, failed, status: "DONE", finishedAt: new Date() } });
  }
}
