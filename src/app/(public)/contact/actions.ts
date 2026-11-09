"use server";

import { z } from "zod";
import { emailFrom, escapeHtml, getResend } from "@/lib/server/email";
import { getSettings } from "@/lib/server/settings";
import { CONTACT_SUBJECTS, type ContactState } from "@/lib/contact";


const schema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: z.email("Adresse e-mail invalide.").trim().max(200),
  subject: z.enum(CONTACT_SUBJECTS),
  message: z.string().trim().min(10, "Votre message est un peu court (10 caractères minimum).").max(5000),
  // Champ piège invisible : rempli uniquement par les robots.
  website: z.string().max(0).optional(),
});


export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;
    if (errors.website) return { status: "success", submittedAt: Date.now() }; // robot : on ne dit rien
    return { status: "error", message: "Vérifiez les champs signalés.", errors, values };
  }

  const siteConfig = await getSettings();
  const resend = getResend();
  if (!resend) {
    console.error("[contact] RESEND_API_KEY manquante");
    return { status: "error", message: `Le formulaire est momentanément indisponible. Écrivez-nous à ${siteConfig.contact.email}.`, values };
  }

  const { name, email, subject, message } = parsed.data;
  const to = process.env.CONTACT_TO_EMAIL ?? siteConfig.contact.email;

  const { error } = await resend.emails.send({
    from: emailFrom(),
    to,
    replyTo: email,
    subject: `[Contact · ${subject}] ${name}`,
    text: `${message}\n\n${name}\n${email}`,
    html: `<p style="white-space:pre-line">${escapeHtml(message)}</p><hr><p><strong>${escapeHtml(name)}</strong><br>${escapeHtml(email)}<br>Sujet : ${escapeHtml(subject)}</p>`,
  });

  if (error) {
    console.error("[contact] échec Resend", error);
    return { status: "error", message: `L'envoi a échoué. Réessayez ou écrivez-nous à ${siteConfig.contact.email}.`, values };
  }

  return { status: "success", message: "Message envoyé. Nous vous répondons par e-mail.", submittedAt: Date.now() };
}
