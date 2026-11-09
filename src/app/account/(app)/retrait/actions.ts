"use server";
import { requireOnboardedUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { getSettings } from "@/lib/server/settings";
import { consumeActionCode, sendActionCode } from "@/lib/server/action-codes";
import { notify } from "@/lib/server/notify";
import { formatEUR } from "@/lib/utils";

type Payload = { amount: number; fee: number; bankAccountId: string };

/** Étape 1 : contrôle du montant et envoi du code par e-mail. */
export async function requestWithdrawal(input: { amount: number; bankAccountId: string }) {
  const user = await requireOnboardedUser();
  if (user.kycStatus !== "APPROVED") return { error: "Votre identité doit être vérifiée avant un retrait." };
  const amount = Math.round(Number(input.amount) * 100) / 100;
  const settings = await getSettings();
  const fee = settings.money.withdrawalFee;
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Indiquez un montant." };
  if (amount < settings.money.withdrawalMin) return { error: `Le retrait minimum est de ${formatEUR(settings.money.withdrawalMin)}.` };
  const bank = await db.bankAccount.findFirst({ where: { id: input.bankAccountId, userId: user.id, archivedAt: null } });
  if (!bank) return { error: "Choisissez un compte bancaire." };
  const cash = Number(user.cashEur);
  if (amount + fee > cash + 0.005) return { error: `Montant trop élevé. Disponible : ${formatEUR(Math.max(0, cash - fee))} après frais.` };
  try {
    const codeId = await sendActionCode(user, "withdrawal", { amount, fee, bankAccountId: bank.id } satisfies Payload, `Montant : ${formatEUR(amount)} vers ${bank.iban.slice(0, 4)} •••• ${bank.iban.slice(-4)}.`);
    return { codeId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Envoi du code impossible." };
  }
}

/** Étape 2 : vérification du code, débit du solde disponible et création de la demande. */
export async function confirmWithdrawal(input: { codeId: string; code: string }) {
  const user = await requireOnboardedUser();
  const check = await consumeActionCode(user.id, input.codeId, "withdrawal", input.code);
  if (!check.ok) return { error: check.error };
  const { amount, fee, bankAccountId } = check.payload as Payload;
  const bank = await db.bankAccount.findFirst({ where: { id: bankAccountId, userId: user.id, archivedAt: null } });
  if (!bank) return { error: "Compte bancaire introuvable." };

  try {
    const w = await db.$transaction(async (tx) => {
      const total = (amount + fee).toFixed(2);
      const debited = await tx.user.updateMany({ where: { id: user.id, cashEur: { gte: total } }, data: { cashEur: { decrement: total } } });
      if (debited.count !== 1) throw new Error("Solde disponible insuffisant.");
      const reference = `RT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const created = await tx.withdrawal.create({ data: { userId: user.id, reference, amountEur: amount, feeEur: fee, bankAccountId } });
      await tx.activity.create({ data: { userId: user.id, type: "WITHDRAW", title: "Retrait demandé", subtitle: `Vers ${bank.iban.slice(0, 4)} •••• ${bank.iban.slice(-4)}`, amountEur: amount, pending: true } });
      return created;
    });
    await notify(user.id, { kind: "withdrawal", title: "Retrait demandé", body: `${formatEUR(amount)} vers ${bank.iban.slice(0, 4)} •••• ${bank.iban.slice(-4)}. Réf. ${w.reference}.`, url: "/account/activite" });
    return { ok: true, reference: w.reference, amount };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Le retrait n'a pas pu être enregistré." };
  }
}

export async function resendWithdrawalCode(input: { amount: number; bankAccountId: string }) {
  return requestWithdrawal(input);
}
