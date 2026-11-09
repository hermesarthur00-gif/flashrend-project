"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";

export type FormState = { error?: string; ok?: string } | undefined;

function ibanValid(raw: string) {
  const v = raw.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z0-9]{6,34}$/.test(v)) return false;
  if (!/^[A-Z]{2}\d{2}/.test(v)) return true; // numéro de compte hors IBAN (comptes en dollars)
  const moved = v.slice(4) + v.slice(0, 4);
  const digits = moved.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rem = 0;
  for (const ch of digits) rem = (rem * 10 + Number(ch)) % 97;
  return rem === 1;
}

const bankSchema = z.object({
  holder: z.string().trim().min(2, "Indiquez le titulaire.").max(120),
  iban: z.string().trim().min(6, "Indiquez l'IBAN ou le numéro de compte.").max(42),
  bic: z.string().trim().max(11).optional(),
  bankName: z.string().trim().max(120).optional(),
});

export type BankResult = { error?: string; ok?: string; id?: string };

/** Contrôle commun des coordonnées de retrait (ajout et correction). */
function parseBank(form: FormData) {
  if (form.get("confirmed") !== "on") return { error: "Confirmez que vous avez vérifié vos coordonnées." } as const;
  const parsed = bankSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const iban = parsed.data.iban.replace(/\s/g, "").toUpperCase();
  if (!ibanValid(iban)) return { error: "Cet IBAN semble incorrect. Vérifiez-le." } as const;
  const bic = parsed.data.bic?.replace(/\s/g, "").toUpperCase();
  if (bic && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic)) return { error: "Le code BIC / SWIFT semble incorrect." } as const;
  return { data: { holder: parsed.data.holder, iban, bic: bic || null, bankName: parsed.data.bankName || null } } as const;
}

function revalidateBanks() {
  revalidatePath("/account/reglages/comptes");
  revalidatePath("/account/retrait");
}

export async function addBankAccount(form: FormData): Promise<BankResult> {
  const user = await requireUser();
  const p = parseBank(form);
  if ("error" in p) return { error: p.error };
  const count = await db.bankAccount.count({ where: { userId: user.id, archivedAt: null } });
  if (count >= 5) return { error: "Vous pouvez enregistrer 5 comptes au maximum." };
  const created = await db.bankAccount.create({ data: { userId: user.id, ...p.data } });
  revalidateBanks();
  return { ok: "Compte enregistré", id: created.id };
}

/**
 * Correction d'un compte. S'il a déjà servi à un retrait, l'ancienne version est archivée
 * (l'historique garde l'IBAN réellement utilisé) et une version corrigée est créée.
 */
export async function updateBankAccount(id: string, form: FormData): Promise<BankResult> {
  const user = await requireUser();
  const account = await db.bankAccount.findFirst({ where: { id, userId: user.id, archivedAt: null } });
  if (!account) return { error: "Compte introuvable." };
  const pending = await db.withdrawal.count({ where: { bankAccountId: id, status: "REQUESTED" } });
  if (pending) return { error: "Un retrait vers ce compte est en cours. Vous pourrez le modifier une fois le retrait traité." };
  const p = parseBank(form);
  if ("error" in p) return { error: p.error };
  const used = await db.withdrawal.count({ where: { bankAccountId: id } });
  let newId = id;
  if (used) {
    const [, created] = await db.$transaction([
      db.bankAccount.update({ where: { id }, data: { archivedAt: new Date() } }),
      db.bankAccount.create({ data: { userId: user.id, ...p.data } }),
    ]);
    newId = created.id;
  } else {
    await db.bankAccount.update({ where: { id }, data: p.data });
  }
  revalidateBanks();
  return { ok: "Coordonnées corrigées", id: newId };
}

export async function deleteBankAccount(id: string) {
  const user = await requireUser();
  const pending = await db.withdrawal.count({ where: { bankAccountId: id, userId: user.id, status: "REQUESTED" } });
  if (pending) return { error: "Un retrait vers ce compte est en cours. Attendez qu'il soit traité." };
  const used = await db.withdrawal.count({ where: { bankAccountId: id, userId: user.id } });
  // Un compte déjà utilisé est archivé : il disparaît de la liste mais reste dans l'historique.
  if (used) await db.bankAccount.updateMany({ where: { id, userId: user.id }, data: { archivedAt: new Date() } });
  else await db.bankAccount.deleteMany({ where: { id, userId: user.id } });
  revalidateBanks();
  return { ok: "Compte supprimé" };
}

export async function updateContact(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const phone = String(form.get("phone") ?? "").trim();
  if (phone && !/^[+\d][\d\s.-]{5,20}$/.test(phone)) return { error: "Numéro de téléphone invalide." };
  await db.user.update({ where: { id: user.id }, data: { phone: phone || null } });
  revalidatePath("/account/reglages");
  return { ok: "Téléphone enregistré" };
}
