"use server";
import { requireOnboardedUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { getSettings } from "@/lib/server/settings";
import { divestToCash, executionPrices, getHoldings, investFromCash, snapshotUser } from "@/lib/server/portfolio";
import { notify } from "@/lib/server/notify";
import { PROFILE_LABELS, formatEUR } from "@/lib/utils";

const round = (n: number) => Math.floor(n * 100) / 100;

/** Investit une partie du solde disponible selon le profil, aux cours du moment. */
export async function investNow(input: { amount: number; all?: boolean }): Promise<{ error?: string; ok?: string; amount?: number }> {
  const user = await requireOnboardedUser();
  if (user.kycStatus !== "APPROVED") return { error: "Votre identité doit être vérifiée avant d'investir." };
  const profile = user.profile!;
  const settings = await getSettings();
  const cash = Number(user.cashEur);
  const amount = input.all ? round(cash) : round(Number(input.amount));
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Indiquez un montant." };
  if (amount < settings.money.investMin) return { error: `L'investissement minimum est de ${formatEUR(settings.money.investMin)}.` };
  if (amount > cash + 0.001) return { error: `Solde disponible insuffisant (${formatEUR(cash)}).` };

  const pm = await executionPrices();
  try {
    await db.$transaction(async (tx) => {
      await investFromCash(tx, user.id, amount, profile, pm);
      await tx.activity.create({ data: { userId: user.id, type: "INVEST", title: "Investissement", subtitle: `Profil ${PROFILE_LABELS[profile].toLowerCase()}`, amountEur: amount } });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "L'investissement n'a pas pu être fait." };
  }
  await snapshotUser(user.id, pm);
  await notify(user.id, { kind: "info", title: "Investissement effectué", body: `${formatEUR(amount)} investis selon votre profil ${PROFILE_LABELS[profile]}.`, url: "/account/portefeuille" });
  return { ok: "Investissement effectué", amount };
}

/** Revend une partie des investissements vers le solde disponible. */
export async function divestNow(input: { amount: number; all?: boolean }): Promise<{ error?: string; ok?: string; amount?: number }> {
  const user = await requireOnboardedUser();
  const pm = await executionPrices();
  const { total } = await getHoldings(user.id, pm);
  let amount = input.all ? round(total) : round(Number(input.amount));
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Indiquez un montant." };
  // Petit écart possible entre le cours affiché et celui d'exécution : on plafonne à la valeur réelle.
  if (amount > total) {
    if (amount > total * 1.01) return { error: `Montant trop élevé. Valeur investie : ${formatEUR(total)}.` };
    amount = round(total);
  }
  try {
    await db.$transaction(async (tx) => {
      await divestToCash(tx, user.id, amount, pm);
      await tx.activity.create({ data: { userId: user.id, type: "DIVEST", title: "Désinvestissement", subtitle: "Ajouté au solde disponible", amountEur: amount } });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Le désinvestissement n'a pas pu être fait." };
  }
  await snapshotUser(user.id, pm);
  return { ok: "Montant ajouté au solde disponible", amount };
}
