"use server";
import { revalidatePath } from "next/cache";
import { requireOnboardedUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { notify, notifyAdmins } from "@/lib/server/notify";
import { REFUND_REASONS } from "@/lib/refund";
import { formatEUR } from "@/lib/utils";

type Input = { depositId: string; reason: string; details: string };

/** Demande de remboursement d'un dépôt crédité : le montant est bloqué tout de suite. */
export async function requestRefund(input: Input) {
  const user = await requireOnboardedUser();
  const reason = input.reason as keyof typeof REFUND_REASONS;
  if (!(reason in REFUND_REASONS)) return { error: "Choisissez un motif." };
  const details = String(input.details ?? "").trim().slice(0, 1000);
  if (reason === "OTHER" && details.length < 5) return { error: "Expliquez votre demande en quelques mots." };

  const deposit = await db.deposit.findFirst({ where: { id: input.depositId, userId: user.id, status: "CREDITED" } });
  if (!deposit || !deposit.creditedEur) return { error: "Dépôt introuvable." };
  const amount = Number(deposit.creditedEur);

  try {
    const r = await db.$transaction(async (tx) => {
      const active = await tx.refundRequest.count({ where: { depositId: deposit.id, status: { in: ["REQUESTED", "ACCEPTED", "REFUNDED"] } } });
      if (active) throw new Error("Une demande existe déjà pour ce dépôt.");
      const debited = await tx.user.updateMany({ where: { id: user.id, cashEur: { gte: amount.toFixed(2) } }, data: { cashEur: { decrement: amount.toFixed(2) } } });
      if (debited.count !== 1) throw new Error("Ce montant n'est plus disponible sur votre solde (déjà investi ou retiré).");
      const reference = `RB-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const created = await tx.refundRequest.create({ data: { userId: user.id, depositId: deposit.id, reference, amountEur: amount, reason, details: details || null } });
      await tx.activity.create({ data: { userId: user.id, type: "REFUND", title: "Remboursement demandé", subtitle: `Réf. ${reference}`, amountEur: amount, pending: true, href: "/account/remboursement" } });
      return created;
    });
    await notify(user.id, { kind: "deposit", title: "Remboursement demandé", body: `${formatEUR(amount)} réservés. Réf. ${r.reference}. Nous revenons vers vous rapidement.`, url: "/account/remboursement", email: { cta: "Suivre ma demande" } });
    await notifyAdmins({ title: "Nouvelle demande de remboursement", lines: [`${user.name} demande le remboursement de ${formatEUR(amount)} (réf. ${r.reference}).`, `Motif : ${REFUND_REASONS[reason]}.`], path: "/admin/remboursements", cta: "Traiter la demande" });
    revalidatePath("/account", "layout");
    return { ok: true, reference: r.reference };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "La demande n'a pas pu être enregistrée." };
  }
}
