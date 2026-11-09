"use server";
import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { getSettings } from "@/lib/server/settings";
import { notify } from "@/lib/server/notify";

export async function announceDeposit(currency: "USD" | "EUR") {
  const user = await requireOnboardedUser();
  if (user.kycStatus !== "APPROVED") return { error: "Votre identité doit être vérifiée avant un dépôt." };
  if (currency !== "USD" && currency !== "EUR") return { error: "Devise non prise en charge." };
  const settings = await getSettings();
  const bank = settings.bank[currency];
  if (!bank.iban) return { error: "Les coordonnées bancaires ne sont pas encore disponibles. Réessayez plus tard." };

  const open = await db.deposit.count({ where: { userId: user.id, status: "ANNOUNCED" } });
  if (open >= 3) return { error: "Vous avez déjà 3 virements en attente. Patientez jusqu'à leur réception." };

  const deposit = await db.$transaction(async (tx) => {
    const d = await tx.deposit.create({ data: { userId: user.id, reference: user.reference!, currency } });
    await tx.activity.create({ data: { userId: user.id, type: "DEPOSIT", title: `Virement en ${currency} annoncé`, subtitle: `Réf. ${user.reference}`, pending: true } });
    return d;
  });

  await notify(user.id, {
    kind: "deposit",
    title: "Virement annoncé",
    body: `Nous attendons votre virement en ${currency}. Réf. ${user.reference}.`,
    url: `/account/depot/${deposit.id}`,
    email: {
      lines: [
        `Nous attendons votre virement en ${currency}. Rappel des coordonnées :`,
        `Bénéficiaire : ${bank.beneficiary}`,
        `IBAN : ${bank.iban}`,
        `BIC / SWIFT : ${bank.swift}`,
        `Banque : ${bank.bankName}`,
        `Référence à indiquer : ${user.reference}`,
        "Sans cette référence, nous ne pouvons pas rattacher le virement à votre compte.",
      ],
      cta: "Suivre mon dépôt",
    },
  });
  redirect(`/account/depot/${deposit.id}`);
}
