"use server";
import { randomInt } from "node:crypto";
import { requireOnboardedUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { notify } from "@/lib/server/notify";
import { FLASH_MS, flashGain } from "@/lib/flash";
import { formatDateTime, formatEUR } from "@/lib/utils";

const round = (n: number) => Math.floor(n * 100 + 1e-9) / 100;

/** Bloque un montant du solde disponible pendant 24 h, au rendement affiché de l'offre. */
export async function subscribeFlash(input: { offerId: string; amount: number }): Promise<{ error?: string; ok?: boolean }> {
  const user = await requireOnboardedUser();
  if (user.kycStatus !== "APPROVED") return { error: "Votre identité doit être vérifiée avant d'investir." };
  const offer = await db.flashOffer.findUnique({ where: { id: String(input.offerId) } });
  if (!offer || !offer.active) return { error: "Cette offre n'est plus disponible." };
  const amount = round(Number(input.amount));
  const min = Number(offer.minEur);
  const max = offer.maxEur === null ? null : Number(offer.maxEur);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Indiquez un montant." };
  if (amount < min) return { error: `Le minimum pour cette offre est de ${formatEUR(min)}.` };
  if (max !== null && amount > max) return { error: `Le maximum pour cette offre est de ${formatEUR(max)}.` };
  const rate = Number(offer.ratePercent);
  const gain = flashGain(amount, rate);
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + FLASH_MS);

  const ok = await db.$transaction(async (tx) => {
    const debit = await tx.user.updateMany({ where: { id: user.id, cashEur: { gte: amount } }, data: { cashEur: { decrement: amount } } });
    if (debit.count === 0) return false;
    await tx.flashInvestment.create({ data: { userId: user.id, offerId: offer.id, offerName: offer.name, ratePercent: rate, amountEur: amount, gainEur: gain, startsAt, endsAt, seed: randomInt(1, 2_000_000_000) } });
    await tx.activity.create({ data: { userId: user.id, type: "FLASH", title: "Flash 24 h lancé", subtitle: `${offer.name} · rendement ${rate.toLocaleString("fr-FR")} %`, amountEur: amount } });
    return true;
  });
  if (!ok) return { error: `Solde disponible insuffisant (${formatEUR(Number(user.cashEur))}).` };
  await notify(user.id, { kind: "info", title: "Flash 24 h lancé", body: `${formatEUR(amount)} bloqués jusqu'au ${formatDateTime(endsAt)}. Rendement : ${formatEUR(gain)}.`, url: "/account/flash" });
  return { ok: true };
}
