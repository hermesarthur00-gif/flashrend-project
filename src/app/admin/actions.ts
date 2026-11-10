"use server";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import type { ProfileId } from "@/generated/prisma/client";
import { audit, requireAdmin } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { executionPrices, rebalanceUser } from "@/lib/server/portfolio";
import { notify } from "@/lib/server/notify";
import { settleDueFlash } from "@/lib/server/flash";
import { getSettings, SETTINGS_TAG } from "@/lib/server/settings";
import { consumeActionCode, sendActionCode } from "@/lib/server/action-codes";
import { mergeSettings, settingsSchema } from "@/lib/settings-schema";
import { isAnonymized } from "@/lib/account-status";
import { deleteOrAnonymize } from "@/lib/server/user-admin";
import { PROFILE_LABELS, formatMoney, formatEUR } from "@/lib/utils";

export type AdminState = { error?: string; ok?: string } | undefined;
export type BankState = { error?: string; ok?: string; codeId?: string } | undefined;
const fail = (e: unknown, fallback: string): AdminState => ({ error: e instanceof Error ? e.message : fallback });
const num = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));

// ---------------------------------------------------------------- utilisateurs

/** Cible d'une action sur un compte, avec les garde-fous communs. */
async function target(adminId: string, form: FormData) {
  const id = String(form.get("userId") ?? "");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const user = id ? await db.user.findUnique({ where: { id } }) : email ? await db.user.findUnique({ where: { email } }) : null;
  if (!user) return { error: email ? "Aucun compte avec cet e-mail. La personne doit d'abord créer un compte." : "Compte introuvable." } as const;
  if (user.id === adminId) return { error: "Vous ne pouvez pas faire cette action sur votre propre compte." } as const;
  if (isAnonymized(user.email)) return { error: "Ce compte a été supprimé." } as const;
  return { user } as const;
}

async function isLastAdmin(userId: string) {
  const admins = await db.user.count({ where: { role: "ADMIN", suspendedAt: null, id: { not: userId } } });
  return admins === 0;
}

export async function setRole(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const t = await target(admin.id, form);
  if ("error" in t) return { error: t.error };
  const role = String(form.get("role")) === "ADMIN" ? "ADMIN" : "CLIENT";
  if (t.user.role === role) return { ok: "Rôle inchangé" };
  if (role === "CLIENT" && (await isLastAdmin(t.user.id))) return { error: "Il doit rester au moins un administrateur." };
  await db.user.update({ where: { id: t.user.id }, data: { role } });
  if (role === "CLIENT") await db.session.deleteMany({ where: { userId: t.user.id } });
  await audit(admin.id, role === "ADMIN" ? "team.add" : "team.remove", { type: "user", id: t.user.id }, { email: t.user.email });
  revalidatePath("/admin", "layout");
  return { ok: role === "ADMIN" ? `${t.user.name} est maintenant administrateur` : `${t.user.name} n'est plus administrateur` };
}

export async function banUser(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const t = await target(admin.id, form);
  if ("error" in t) return { error: t.error };
  const reason = String(form.get("reason") ?? "").trim();
  if (reason.length < 3) return { error: "Indiquez le motif du bannissement." };
  if (t.user.suspendedAt) return { error: "Ce compte est déjà banni." };
  if (t.user.role === "ADMIN" && (await isLastAdmin(t.user.id))) return { error: "Il doit rester au moins un administrateur." };
  await db.user.update({ where: { id: t.user.id }, data: { suspendedAt: new Date(), suspendReason: reason } });
  await db.session.deleteMany({ where: { userId: t.user.id } });
  await audit(admin.id, "client.suspend", { type: "user", id: t.user.id }, { reason });
  revalidatePath("/admin", "layout");
  return { ok: "Compte banni, sessions fermées" };
}

export async function unbanUser(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const t = await target(admin.id, form);
  if ("error" in t) return { error: t.error };
  if (!t.user.suspendedAt) return { error: "Ce compte n'est pas banni." };
  await db.user.update({ where: { id: t.user.id }, data: { suspendedAt: null, suspendReason: null } });
  await audit(admin.id, "client.reactivate", { type: "user", id: t.user.id });
  revalidatePath("/admin", "layout");
  return { ok: "Compte réactivé" };
}

export async function deleteUser(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const t = await target(admin.id, form);
  if ("error" in t) return { error: t.error };
  if (String(form.get("confirm") ?? "").trim().toLowerCase() !== t.user.email) return { error: "L'e-mail saisi ne correspond pas." };
  if (t.user.role === "ADMIN" && (await isLastAdmin(t.user.id))) return { error: "Il doit rester au moins un administrateur." };
  try {
    const result = await deleteOrAnonymize(t.user.id);
    await audit(admin.id, result === "deleted" ? "client.delete" : "client.anonymize", { type: "user", id: t.user.id }, { email: t.user.email, reference: t.user.reference });
    revalidatePath("/admin", "layout");
    return { ok: result === "deleted" ? "Compte supprimé" : "Compte anonymisé, historique financier conservé" };
  } catch (e) {
    return fail(e, "Suppression impossible.");
  }
}

// ---------------------------------------------------------------- identité

export async function reviewKyc(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const decision = String(form.get("decision"));
  const reason = String(form.get("reason") ?? "").trim();
  const sub = await db.kycSubmission.findUnique({ where: { id } });
  if (!sub || sub.status !== "PENDING") return { error: "Ce dossier a déjà été traité." };
  if (decision === "reject" && reason.length < 4) return { error: "Indiquez le motif du refus, il sera visible par le client." };
  const approved = decision === "approve";
  await db.$transaction([
    db.kycSubmission.update({ where: { id }, data: { status: approved ? "APPROVED" : "REJECTED", rejectReason: approved ? null : reason, reviewerId: admin.id, reviewedAt: new Date() } }),
    db.user.update({ where: { id: sub.userId }, data: { kycStatus: approved ? "APPROVED" : "REJECTED" } }),
  ]);
  await notify(sub.userId, approved
    ? { kind: "kyc", title: "Identité vérifiée", body: "Votre compte est actif, vous pouvez déposer.", url: "/account/depot", email: { cta: "Faire un dépôt" } }
    : { kind: "kyc", title: "Vérification à reprendre", body: `Motif : ${reason}`, url: "/account/verification", email: { lines: ["Nous n'avons pas pu valider votre identité.", `Motif : ${reason}`, "Vous pouvez recommencer la vérification depuis l'app."], cta: "Reprendre la vérification" } });
  await audit(admin.id, approved ? "kyc.approve" : "kyc.reject", { type: "user", id: sub.userId }, approved ? undefined : { reason });
  revalidatePath("/admin", "layout");
  return { ok: approved ? "Identité validée" : "Dossier refusé" };
}

// ---------------------------------------------------------------- dépôts

/** Le virement est bien arrivé : le solde disponible du client est crédité (en euros). */
export async function reconcileDeposit(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const amount = num(form.get("amount"));
  const receivedAt = form.get("receivedAt") ? new Date(String(form.get("receivedAt"))) : new Date();
  const d = await db.deposit.findUnique({ where: { id }, include: { user: true } });
  if (!d || d.status !== "ANNOUNCED") return { error: "Ce dépôt a déjà été traité." };
  if (!(amount > 0)) return { error: "Indiquez le montant reçu." };
  const credited = Math.round(amount * 100) / 100;
  try {
    await db.$transaction(async (tx) => {
    const claimed = await tx.deposit.updateMany({ where: { id, status: "ANNOUNCED" }, data: { status: "CREDITED", receivedAmount: amount, creditedEur: credited, receivedAt, processedById: admin.id } });
    if (claimed.count !== 1) throw new Error("Ce dépôt a déjà été traité.");
    await tx.user.update({ where: { id: d.userId }, data: { cashEur: { increment: credited.toFixed(2) } } });
    await tx.activity.updateMany({ where: { userId: d.userId, type: "DEPOSIT", pending: true, subtitle: { endsWith: `réf. ${d.reference}` }, createdAt: { gte: new Date(d.announcedAt.getTime() - 5000), lte: new Date(d.announcedAt.getTime() + 5000) } }, data: { pending: false, title: "Dépôt crédité", amountEur: credited } });
    });
  } catch (e) {
    return fail(e, "Le crédit n'a pas pu être enregistré.");
  }
  const diff = d.declaredAmount && Math.abs(Number(d.declaredAmount) - amount) >= 0.01 ? ` Montant reçu : ${formatMoney(amount, d.currency)} (déclaré : ${formatMoney(Number(d.declaredAmount), d.currency)}).` : "";
  await notify(d.userId, {
    kind: "deposit",
    title: "Votre compte est crédité",
    body: `${formatEUR(credited)} ajoutés à votre solde disponible. Vous pouvez maintenant les investir.${diff}`,
    url: "/account/investir",
    email: { lines: [`Nous avons bien reçu votre virement : ${formatEUR(credited)} sont ajoutés à votre solde disponible.${diff}`, "Vous pouvez maintenant les investir depuis l'app, selon votre profil."], cta: "Investir" },
  });
  await audit(admin.id, "deposit.credit", { type: "deposit", id }, { amount, credited, declared: d.declaredAmount ? Number(d.declaredAmount) : null });
  revalidatePath("/admin", "layout");
  return { ok: `${formatEUR(credited)} crédités pour ${d.user.name}` };
}

export async function rejectDeposit(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const note = String(form.get("note") ?? "").trim();
  if (note.length < 4) return { error: "Indiquez la raison, elle sera visible par le client." };
  const d = await db.deposit.findUnique({ where: { id } });
  if (!d || d.status !== "ANNOUNCED") return { error: "Ce dépôt a déjà été traité." };
  await db.deposit.update({ where: { id }, data: { status: "REJECTED", note, processedById: admin.id } });
  await db.activity.updateMany({ where: { userId: d.userId, type: "DEPOSIT", pending: true, subtitle: { endsWith: `réf. ${d.reference}` }, createdAt: { gte: new Date(d.announcedAt.getTime() - 5000), lte: new Date(d.announcedAt.getTime() + 5000) } }, data: { pending: false, title: "Dépôt refusé" } });
  await notify(d.userId, { kind: "deposit", title: "Dépôt refusé", body: note, url: `/account/depot/${d.id}`, email: { lines: ["Nous n'avons pas pu valider votre dépôt.", `Raison : ${note}`, "Rien n'a été débité de votre solde FlashInv."], cta: "Voir le détail" } });
  await audit(admin.id, "deposit.reject", { type: "deposit", id }, { note });
  revalidatePath("/admin", "layout");
  return { ok: "Dépôt marqué comme refusé" };
}

/** Virement reçu sans annonce préalable : retrouvé par sa référence. */
export async function recordUnannouncedDeposit(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const reference = String(form.get("reference") ?? "").trim().toUpperCase();
  const currency = "EUR" as const;
  const user = await db.user.findUnique({ where: { reference } });
  if (!user) return { error: `Aucun client avec la référence ${reference}.` };
  const d = await db.deposit.create({ data: { userId: user.id, reference, currency, declaredAmount: num(form.get("amount")) || null } });
  await db.activity.create({ data: { userId: user.id, type: "DEPOSIT", title: "Dépôt en vérification", subtitle: `Virement reçu · réf. ${reference}`, pending: true, createdAt: d.announcedAt } });
  const fd = new FormData();
  fd.set("id", d.id);
  fd.set("amount", String(form.get("amount")));
  const res = await reconcileDeposit(undefined, fd);
  if (res?.error) {
    await db.deposit.delete({ where: { id: d.id } });
    await db.activity.deleteMany({ where: { userId: user.id, type: "DEPOSIT", pending: true, subtitle: `Virement reçu · réf. ${reference}` } });
  }
  return res;
}

// ---------------------------------------------------------------- retraits

export async function markWithdrawalSent(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const bankReference = String(form.get("bankReference") ?? "").trim();
  const w = await db.withdrawal.findUnique({ where: { id }, include: { bankAccount: true } });
  if (!w || w.status !== "REQUESTED") return { error: "Ce retrait a déjà été traité." };
  await db.withdrawal.update({ where: { id }, data: { status: "SENT", sentAt: new Date(), bankReference: bankReference || null, processedById: admin.id } });
  await db.activity.updateMany({ where: { userId: w.userId, type: "WITHDRAW", pending: true, amountEur: w.amountEur }, data: { pending: false, title: "Retrait envoyé" } });
  const masked = `${w.bankAccount.iban.slice(0, 4)} •••• ${w.bankAccount.iban.slice(-4)}`;
  await notify(w.userId, { kind: "withdrawal", title: "Retrait envoyé", body: `${formatEUR(Number(w.amountEur))} partis vers ${masked}.`, url: "/account/activite", email: { cta: "Voir l'activité" } });
  await audit(admin.id, "withdrawal.sent", { type: "withdrawal", id }, { bankReference });
  revalidatePath("/admin", "layout");
  return { ok: "Retrait marqué comme envoyé" };
}

export async function rejectWithdrawal(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const reason = String(form.get("reason") ?? "").trim();
  if (reason.length < 4) return { error: "Indiquez le motif, il sera visible par le client." };
  const w = await db.withdrawal.findUnique({ where: { id }, include: { user: true } });
  if (!w || w.status !== "REQUESTED") return { error: "Ce retrait a déjà été traité." };
  const refund = Number(w.amountEur) + Number(w.feeEur);
  try {
    await db.$transaction(async (tx) => {
      const claimed = await tx.withdrawal.updateMany({ where: { id, status: "REQUESTED" }, data: { status: "REJECTED", rejectReason: reason, processedById: admin.id } });
      if (claimed.count !== 1) throw new Error("Ce retrait a déjà été traité.");
      await tx.user.update({ where: { id: w.userId }, data: { cashEur: { increment: refund.toFixed(2) } } });
      await tx.activity.updateMany({ where: { userId: w.userId, type: "WITHDRAW", pending: true, amountEur: w.amountEur }, data: { pending: false, title: "Retrait annulé", subtitle: "Montant rendu au solde disponible" } });
    });
  } catch (e) {
    return fail(e, "L'annulation a échoué.");
  }
  await notify(w.userId, { kind: "withdrawal", title: "Retrait annulé", body: `${reason} Le montant et les frais ont été rendus à votre solde disponible.`, url: "/account/activite", email: { cta: "Voir l'activité" } });
  await audit(admin.id, "withdrawal.reject", { type: "withdrawal", id }, { reason });
  revalidatePath("/admin", "layout");
  return { ok: "Retrait refusé, montant rendu au solde disponible" };
}

// ---------------------------------------------------------------- profils

export async function saveAllocation(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const profile = String(form.get("profile")) as ProfileId;
  if (!["CAREFUL", "BALANCED", "BOLD"].includes(profile)) return { error: "Profil inconnu." };
  const assets = await db.asset.findMany({ where: { active: true } });
  const rows = assets.map((a) => ({ symbol: a.symbol, percent: Math.round(num(form.get(`p_${a.symbol}`)) * 100) / 100 || 0 })).filter((r) => r.percent > 0);
  const total = rows.reduce((s, r) => s + r.percent, 0);
  if (rows.some((r) => r.percent < 0 || r.percent > 100)) return { error: "Chaque part doit être comprise entre 0 et 100 %." };
  if (Math.abs(total - 100) > 0.001) return { error: `Le total doit faire 100 % (actuellement ${total.toLocaleString("fr-FR")} %).` };

  const before = await db.profileAllocation.findMany({ where: { profile } });
  const summary = rows.map((r) => `${r.symbol} ${r.percent} %`).join(", ");
  await db.$transaction([db.profileAllocation.deleteMany({ where: { profile } }), ...rows.map((r) => db.profileAllocation.create({ data: { profile, symbol: r.symbol, percent: r.percent } }))]);

  let clients = 0;
  if (form.get("rebalance") === "on") {
    const pm = await executionPrices();
    const users = await db.user.findMany({ where: { profile, positions: { some: { quantity: { gt: 0 } } } }, select: { id: true } });
    for (const u of users) {
      const value = await db.$transaction((tx) => rebalanceUser(tx, u.id, profile, pm));
      if (value > 0) {
        clients++;
        await db.activity.create({ data: { userId: u.id, type: "REBALANCE", title: "Portefeuille rééquilibré", subtitle: `Nouvelle répartition ${PROFILE_LABELS[profile].toLowerCase()}` } });
        await notify(u.id, { kind: "rebalance", title: "Portefeuille rééquilibré", body: `La répartition de votre profil ${PROFILE_LABELS[profile]} a été ajustée.`, url: "/account/portefeuille" });
      }
    }
  }
  await db.rebalance.create({ data: { profile, summary, clients, actorId: admin.id } });
  await audit(admin.id, "profile.allocation", { type: "profile", id: profile }, { before: before.map((b) => ({ symbol: b.symbol, percent: Number(b.percent) })), after: rows, clients });
  updateTag("allocations");
  revalidatePath("/admin/profils");
  return { ok: clients ? `Répartition enregistrée, ${clients} portefeuille${clients > 1 ? "s" : ""} rééquilibré${clients > 1 ? "s" : ""}` : "Répartition enregistrée" };
}

// ---------------------------------------------------------------- réglages

const SECTIONS = ["legal", "contact", "money"] as const;

export async function saveSettings(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const section = String(form.get("section")) as (typeof SECTIONS)[number];
  if (!SECTIONS.includes(section)) return { error: "Section inconnue." };
  const current = await getSettings();
  const raw = Object.fromEntries([...form.entries()].filter(([k]) => !k.startsWith("$") && k !== "section").map(([k, v]) => [k, String(v)]));
  const shape = settingsSchema.shape[section];
  const parsed = shape.safeParse(section === "money" ? Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, /Usd|Rate/.test(k) ? v.replace(",", ".").replace(/\s/g, "") : v])) : raw);
  if (!parsed.success) return { error: `${parsed.error.issues[0].path.join(".")} : valeur invalide.` };
  const next = mergeSettings({ ...current, [section]: { ...current[section], ...parsed.data } });
  await db.siteSettings.upsert({ where: { id: "site" }, create: { id: "site", data: next }, update: { data: next } });
  await audit(admin.id, `settings.${section}`, { type: "settings", id: section }, parsed.data);
  updateTag(SETTINGS_TAG);
  return { ok: "Réglages enregistrés" };
}

const bankFields = z.object({
  currency: z.literal("EUR"),
  beneficiary: z.string().trim().min(2, "Indiquez le bénéficiaire.").max(120),
  iban: z.string().trim().min(6, "Indiquez l'IBAN ou le numéro de compte.").max(64),
  swift: z.string().trim().max(20),
  bankName: z.string().trim().max(120),
  bankAddress: z.string().trim().max(200),
});

/** Coordonnées bancaires : changement sensible, confirmé par un code envoyé à l'admin. */
export async function requestBankChange(_: BankState, form: FormData): Promise<BankState> {
  const admin = await requireAdmin();
  const parsed = bankFields.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Coordonnées invalides." };
  const data = { ...parsed.data, iban: parsed.data.iban.replace(/\s/g, "").toUpperCase(), swift: parsed.data.swift.replace(/\s/g, "").toUpperCase() };
  try {
    const codeId = await sendActionCode(admin, "settings-change", data, `Modification des coordonnées bancaires ${data.currency} de FlashInv.`);
    return { ok: "Code envoyé par e-mail", codeId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Envoi du code impossible." };
  }
}

export async function confirmBankChange(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const check = await consumeActionCode(admin.id, String(form.get("codeId")), "settings-change", String(form.get("code") ?? ""));
  if (!check.ok) return { error: check.error };
  const data = bankFields.parse(check.payload);
  const current = await getSettings();
  const { currency, ...bank } = data;
  const next = mergeSettings({ ...current, bank: { ...current.bank, [currency]: bank } });
  await db.siteSettings.upsert({ where: { id: "site" }, create: { id: "site", data: next }, update: { data: next } });
  await audit(admin.id, "settings.bank", { type: "settings", id: currency }, { before: current.bank[currency], after: bank });
  updateTag(SETTINGS_TAG);
  return { ok: `Coordonnées ${currency} enregistrées` };
}

// ---------------------------------------------------------------- flash 24 h

/** Crée ou modifie une offre. Le changement ne touche pas les investissements déjà lancés (rendement figé). */
export async function saveFlashOffer(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const rate = Math.round(num(form.get("rate")) * 100) / 100;
  const min = Math.round(num(form.get("min")) * 100) / 100;
  const maxRaw = String(form.get("max") ?? "").trim();
  const max = maxRaw ? Math.round(num(form.get("max")) * 100) / 100 : null;
  if (name.length < 2 || name.length > 40) return { error: "Donnez un nom à l'offre (2 à 40 caractères)." };
  if (!Number.isFinite(rate) || rate <= 0 || rate > 100) return { error: "Le rendement doit être compris entre 0,01 et 100 %." };
  if (!Number.isFinite(min) || min <= 0) return { error: "Indiquez un montant minimum." };
  if (max !== null && (!Number.isFinite(max) || max < min)) return { error: "Le maximum doit être supérieur ou égal au minimum." };
  const data = { name, ratePercent: rate, minEur: min, maxEur: max };
  if (id) {
    const before = await db.flashOffer.findUnique({ where: { id } });
    if (!before) return { error: "Offre introuvable." };
    await db.flashOffer.update({ where: { id }, data });
    await audit(admin.id, "flash.offer.update", { type: "flash-offer", id }, { before: { name: before.name, rate: Number(before.ratePercent), min: Number(before.minEur), max: before.maxEur === null ? null : Number(before.maxEur) }, after: { name, rate, min, max } });
  } else {
    const created = await db.flashOffer.create({ data });
    await audit(admin.id, "flash.offer.create", { type: "flash-offer", id: created.id }, { name, rate, min, max });
  }
  revalidatePath("/admin/flash");
  return { ok: id ? "Offre enregistrée" : "Offre créée" };
}

export async function toggleFlashOffer(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const offer = await db.flashOffer.findUnique({ where: { id } });
  if (!offer) return { error: "Offre introuvable." };
  await db.flashOffer.update({ where: { id }, data: { active: !offer.active } });
  await audit(admin.id, offer.active ? "flash.offer.close" : "flash.offer.open", { type: "flash-offer", id }, { name: offer.name });
  revalidatePath("/admin/flash");
  return { ok: offer.active ? "Offre fermée aux nouvelles souscriptions" : "Offre ouverte aux clients" };
}

export async function deleteFlashOffer(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const offer = await db.flashOffer.findUnique({ where: { id }, include: { _count: { select: { investments: true } } } });
  if (!offer) return { error: "Offre introuvable." };
  if (offer._count.investments > 0) return { error: "Cette offre a déjà des souscriptions. Fermez-la plutôt que de la supprimer." };
  await db.flashOffer.delete({ where: { id } });
  await audit(admin.id, "flash.offer.delete", { type: "flash-offer", id }, { name: offer.name });
  revalidatePath("/admin/flash");
  return { ok: "Offre supprimée" };
}

/** Verse tout de suite les investissements arrivés à échéance. */
export async function settleFlashNow(): Promise<AdminState> {
  const admin = await requireAdmin();
  const n = await settleDueFlash();
  await audit(admin.id, "flash.settle", undefined, { settled: n });
  revalidatePath("/admin/flash");
  return { ok: n ? `${n} investissement${n > 1 ? "s" : ""} clôturé${n > 1 ? "s" : ""}` : "Rien à clôturer pour l'instant" };
}
