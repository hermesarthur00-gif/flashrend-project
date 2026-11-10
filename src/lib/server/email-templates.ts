import "server-only";
import { escapeHtml } from "./email";

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL ?? "https://flashinv.com";

/** Gabarit commun : fond crème, bandeau noir, éclair jaune. Tableaux pour la compatibilité des clients mail. */
function layout({ title, body, cta, footer }: { title: string; body: string; cta?: { label: string; href: string }; footer?: string }) {
  const button = cta
    ? `<tr><td style="padding:8px 32px 8px"><a href="${cta.href}" style="display:inline-block;background:#FDD700;color:#111110;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:8px;font-size:15px">${escapeHtml(cta.label)}</a></td></tr>`
    : "";
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#F6F4EC;font-family:Helvetica,Arial,sans-serif;color:#111110">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F4EC;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFDF7;border:1px solid #E0DCCD;border-radius:12px;overflow:hidden">
<tr><td style="background:#111110;padding:18px 32px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:28px;height:28px;background:#FDD700;border-radius:7px;text-align:center;font-size:17px;line-height:28px;color:#111110;font-weight:700">&#9889;&#xFE0E;</td>
<td style="padding-left:10px;color:#F6F4EC;font-size:18px;font-weight:700;letter-spacing:-.01em">FlashInv</td></tr></table></td></tr>
<tr><td style="padding:28px 32px 4px"><h1 style="margin:0;font-size:22px;line-height:28px">${escapeHtml(title)}</h1></td></tr>
<tr><td style="padding:12px 32px 12px;font-size:15px;line-height:23px;color:#2b2a26">${body}</td></tr>
${button}
<tr><td style="padding:20px 32px 28px;font-size:12px;line-height:18px;color:#5C584E;border-top:1px solid #E0DCCD">${footer ?? "Vous recevez cet e-mail car vous avez un compte FlashInv. Si vous n'êtes pas à l'origine de cette demande, ignorez-le et changez votre mot de passe."}</td></tr>
</table></td></tr></table></body></html>`;
}

function codeBlock(code: string) {
  return `<p style="margin:16px 0;font-size:32px;line-height:40px;font-weight:700;letter-spacing:.3em;background:#FFF1A8;border-radius:8px;padding:12px 16px;text-align:center">${escapeHtml(code)}</p>`;
}

export type CodePurpose = "sign-in" | "email-verification" | "forget-password" | "withdrawal" | "change-email" | "settings-change";

const CODE_COPY: Record<CodePurpose, { subject: string; title: string; intro: string }> = {
  "sign-in": { subject: "Votre code de connexion", title: "Votre code de connexion", intro: "Saisissez ce code pour vous connecter à FlashInv." },
  "email-verification": { subject: "Confirmez votre adresse e-mail", title: "Bienvenue chez FlashInv", intro: "Saisissez ce code pour confirmer votre adresse e-mail." },
  "forget-password": { subject: "Réinitialisation du mot de passe", title: "Nouveau mot de passe", intro: "Saisissez ce code pour choisir un nouveau mot de passe." },
  withdrawal: { subject: "Confirmez votre retrait", title: "Confirmez votre retrait", intro: "Saisissez ce code pour confirmer votre demande de retrait." },
  "settings-change": { subject: "Confirmez la modification", title: "Modification sensible", intro: "Saisissez ce code pour confirmer la modification des réglages FlashInv." },
  "change-email": { subject: "Confirmez votre nouvelle adresse", title: "Nouvelle adresse e-mail", intro: "Saisissez ce code pour confirmer votre nouvelle adresse e-mail." },
};

export function codeEmail(purpose: CodePurpose, code: string, minutes = 10, detail?: string) {
  const c = CODE_COPY[purpose];
  const extra = detail ? `<p style="margin:0 0 8px">${escapeHtml(detail)}</p>` : "";
  return {
    subject: `${c.subject} : ${code}`,
    html: layout({
      title: c.title,
      body: `<p style="margin:0">${c.intro}</p>${codeBlock(code)}${extra}<p style="margin:0;color:#5C584E">Il expire dans ${minutes} minutes. Ne le communiquez à personne, FlashInv ne vous le demandera jamais.</p>`,
    }),
    text: `${c.intro}\n\nCode : ${code}\n${detail ? `${detail}\n` : ""}Il expire dans ${minutes} minutes.`,
  };
}

export function noticeEmail({ title, lines, cta }: { title: string; lines: string[]; cta?: { label: string; path: string } }) {
  const href = cta ? `${APP_URL()}${cta.path}` : undefined;
  return {
    subject: title,
    html: layout({
      title,
      body: lines.map((l) => `<p style="margin:0 0 10px">${escapeHtml(l)}</p>`).join(""),
      cta: cta && href ? { label: cta.label, href } : undefined,
    }),
    text: `${title}\n\n${lines.join("\n")}${href ? `\n\n${href}` : ""}`,
  };
}

/** Message rédigé par un administrateur : contenu HTML déjà nettoyé, dans le gabarit FlashInv. */
export function broadcastEmail({ subject, bodyHtml, bodyText }: { subject: string; bodyHtml: string; bodyText: string }) {
  return {
    subject,
    html: layout({
      title: subject,
      body: bodyHtml,
      footer: "Message de l'équipe FlashInv. Pour toute question, répondez à cet e-mail ou écrivez-nous depuis flashinv.com.",
    }),
    text: `${subject}\n\n${bodyText}\n\n— L'équipe FlashInv`,
  };
}
