import "server-only";
import { db } from "./db";
import { notify } from "./notify";
import { formatEUR } from "../utils";

/**
 * Clôture les investissements Flash arrivés à échéance : capital + rendement reviennent sur le solde disponible.
 * Appelée à l'ouverture de l'app (pour le client concerné), depuis l'admin et par la tâche planifiée.
 * Le passage RUNNING → MATURED est conditionnel : une échéance n'est jamais versée deux fois.
 */
export async function settleDueFlash(userId?: string) {
  const due = await db.flashInvestment.findMany({ where: { status: "RUNNING", endsAt: { lte: new Date() }, ...(userId ? { userId } : {}) } });
  let settled = 0;
  for (const f of due) {
    const payout = Number(f.amountEur) + Number(f.gainEur);
    const done = await db.$transaction(async (tx) => {
      const res = await tx.flashInvestment.updateMany({ where: { id: f.id, status: "RUNNING" }, data: { status: "MATURED", settledAt: new Date() } });
      if (res.count === 0) return false;
      await tx.user.update({ where: { id: f.userId }, data: { cashEur: { increment: payout } } });
      await tx.activity.create({
        data: { userId: f.userId, type: "FLASH", href: "/account/flash", title: "Flash 24 h terminé", subtitle: `${f.offerName} · rendement ${Number(f.ratePercent).toLocaleString("fr-FR")} %`, amountEur: payout },
      });
      return true;
    });
    if (!done) continue;
    settled++;
    await notify(f.userId, {
      kind: "info",
      title: "Votre Flash 24 h est terminé",
      body: `${formatEUR(payout)} (dont ${formatEUR(Number(f.gainEur))} de rendement) ont été ajoutés à votre solde disponible.`,
      url: "/account/flash",
      email: { lines: [`Votre investissement Flash de ${formatEUR(Number(f.amountEur))} est arrivé à échéance.`, `Rendement : ${formatEUR(Number(f.gainEur))}. Total ajouté à votre solde disponible : ${formatEUR(payout)}.`], cta: "Voir mon solde" },
    }).catch(() => {});
  }
  return settled;
}
