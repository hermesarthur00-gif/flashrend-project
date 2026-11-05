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

export async function addBankAccount(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = bankSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const iban = parsed.data.iban.replace(/\s/g, "").toUpperCase();
  if (!ibanValid(iban)) return { error: "Cet IBAN semble incorrect. Vérifiez-le." };
  const bic = parsed.data.bic?.replace(/\s/g, "").toUpperCase();
  if (bic && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic)) return { error: "Le code BIC / SWIFT semble incorrect." };
  const count = await db.bankAccount.count({ where: { userId: user.id } });
  if (count >= 5) return { error: "Vous pouvez enregistrer 5 comptes au maximum." };
  await db.bankAccount.create({ data: { userId: user.id, holder: parsed.data.holder, iban, bic: bic || null, bankName: parsed.data.bankName || null } });
  revalidatePath("/account/reglages/comptes");
  return { ok: "Compte ajouté" };
}

export async function deleteBankAccount(id: string) {
  const user = await requireUser();
  const busy = await db.withdrawal.count({ where: { bankAccountId: id, userId: user.id } });
  if (busy) return { error: "Ce compte a déjà servi à un retrait, il ne peut pas être supprimé." };
  await db.bankAccount.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/account/reglages/comptes");
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
