import "server-only";
import { db } from "./db";
import { getHoldings } from "./portfolio";
import { deletePrivate } from "./uploads";
import { ANONYMIZED_DOMAIN } from "../account-status";

/**
 * Suppression d'un compte.
 * - Aucune opération : suppression complète.
 * - Sinon : anonymisation. L'historique financier est conservé (obligation de conservation),
 *   les données personnelles, pièces d'identité et coordonnées bancaires sont effacées.
 */
export async function deleteOrAnonymize(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, include: { kyc: true } });
  if (!user) throw new Error("Compte introuvable.");

  const [{ total }, pendingDeposits, pendingWithdrawals, deposits, withdrawals, actor, reviews, flashes, flashRunning, refunds, refundsActive] = await Promise.all([
    getHoldings(userId),
    db.deposit.count({ where: { userId, status: "ANNOUNCED" } }),
    db.withdrawal.count({ where: { userId, status: "REQUESTED" } }),
    db.deposit.count({ where: { userId } }),
    db.withdrawal.count({ where: { userId } }),
    db.auditLog.count({ where: { actorId: userId } }),
    db.kycSubmission.count({ where: { reviewerId: userId } }),
    db.flashInvestment.count({ where: { userId } }),
    db.flashInvestment.count({ where: { userId, status: "RUNNING" } }),
    db.refundRequest.count({ where: { userId } }),
    db.refundRequest.count({ where: { userId, status: { in: ["REQUESTED", "ACCEPTED"] } } }),
  ]);
  if (flashRunning) throw new Error("Ce compte a un investissement Flash en cours. Attendez son échéance.");
  if (total > 0.01 || Number(user.cashEur) > 0.004) throw new Error("Ce compte a encore un solde (disponible ou investi). Le client doit d'abord tout retirer.");
  if (pendingDeposits || pendingWithdrawals || refundsActive) throw new Error("Ce compte a une opération en attente. Traitez-la d'abord.");

  const docs = user.kyc.flatMap((k) => [k.frontId, k.backId, k.selfieId]);
  const hasHistory = deposits + withdrawals + actor + reviews + flashes + refunds > 0;

  if (!hasHistory) {
    await db.user.delete({ where: { id: userId } });
    await Promise.all(docs.map(deletePrivate));
    return "deleted" as const;
  }

  await db.$transaction([
    db.session.deleteMany({ where: { userId } }),
    db.account.deleteMany({ where: { userId } }),
    db.twoFactor.deleteMany({ where: { userId } }),
    db.pushSubscription.deleteMany({ where: { userId } }),
    db.notification.deleteMany({ where: { userId } }),
    db.actionCode.deleteMany({ where: { userId } }),
    db.portfolioSnapshot.deleteMany({ where: { userId } }),
    db.position.deleteMany({ where: { userId } }),
    db.kycSubmission.updateMany({ where: { userId }, data: { birthDate: "", address: "", postalCode: "", city: "", country: "", frontId: null, backId: null, selfieId: null } }),
    db.bankAccount.deleteMany({ where: { userId, withdrawals: { none: {} } } }),
    db.bankAccount.updateMany({ where: { userId }, data: { holder: "Compte supprimé", bic: null, bankName: null } }),
    db.user.update({
      where: { id: userId },
      data: {
        name: "Compte supprimé",
        firstName: null,
        lastName: null,
        phone: null,
        image: null,
        email: `${userId}@${ANONYMIZED_DOMAIN}`,
        emailVerified: false,
        role: "CLIENT",
        suspendedAt: new Date(),
        suspendReason: "Compte supprimé",
      },
    }),
  ]);
  // IBAN réduits aux 4 derniers caractères (les retraits passés y restent rattachés).
  const accounts = await db.bankAccount.findMany({ where: { userId } });
  for (const a of accounts) await db.bankAccount.update({ where: { id: a.id }, data: { iban: `•••• ${a.iban.slice(-4)}` } });
  await Promise.all(docs.map(deletePrivate));
  return "anonymized" as const;
}
