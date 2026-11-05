"use server";
import { createHmac } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { uploadPrivate } from "@/lib/server/uploads";

const sign = (userId: string, id: string) => createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "dev").update(`${userId}:${id}`).digest("hex").slice(0, 32);

/** Envoie un fichier (un par appel, pour rester sous la limite de taille des requêtes). */
export async function uploadKycFile(form: FormData): Promise<{ token?: string; error?: string }> {
  const user = await requireUser();
  if (user.kycStatus === "PENDING" || user.kycStatus === "APPROVED") return { error: "Votre vérification est déjà envoyée." };
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Fichier manquant." };
  try {
    const id = await uploadPrivate(file, `kyc/${user.id}`);
    return { token: `${id}~${sign(user.id, id)}` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Envoi impossible." };
  }
}

function verifyToken(userId: string, token: string | undefined) {
  if (!token) return null;
  const i = token.lastIndexOf("~");
  const id = token.slice(0, i);
  return token.slice(i + 1) === sign(userId, id) ? id : null;
}

const schema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de naissance invalide."),
  address: z.string().trim().min(4, "Indiquez votre adresse.").max(200),
  postalCode: z.string().trim().min(3, "Code postal invalide.").max(12),
  city: z.string().trim().min(2, "Indiquez votre ville.").max(80),
  country: z.string().trim().min(2, "Indiquez votre pays.").max(80),
  docType: z.enum(["id", "passport"]),
  front: z.string(),
  back: z.string().optional(),
  selfie: z.string(),
});

export async function submitKyc(input: z.input<typeof schema>) {
  const user = await requireUser();
  if (user.kycStatus === "PENDING" || user.kycStatus === "APPROVED") return { error: "Votre vérification est déjà envoyée." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const age = (Date.now() - new Date(d.birthDate).getTime()) / (365.25 * 86400000);
  if (!(age >= 18 && age < 120)) return { error: "Vous devez être majeur pour ouvrir un compte." };
  const frontId = verifyToken(user.id, d.front);
  const selfieId = verifyToken(user.id, d.selfie);
  const backId = d.docType === "id" ? verifyToken(user.id, d.back) : null;
  if (!frontId || !selfieId || (d.docType === "id" && !backId)) return { error: "Un document est manquant. Ajoutez-le à nouveau." };

  await db.$transaction([
    db.kycSubmission.create({
      data: { userId: user.id, birthDate: d.birthDate, address: d.address, postalCode: d.postalCode, city: d.city, country: d.country, docType: d.docType, frontId, backId, selfieId },
    }),
    db.user.update({ where: { id: user.id }, data: { kycStatus: "PENDING" } }),
  ]);
  revalidatePath("/account", "layout");
  return { ok: true };
}
