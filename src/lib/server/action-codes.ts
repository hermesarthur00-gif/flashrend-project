import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { sendEmail } from "./email";
import { codeEmail, type CodePurpose } from "./email-templates";

const TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

const hash = (code: string) => createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "dev").update(code).digest("hex");

/** Crée un code à 6 chiffres pour une action sensible et l'envoie par e-mail. */
export async function sendActionCode(user: { id: string; email: string }, purpose: CodePurpose, payload: Prisma.InputJsonValue, detail?: string) {
  const recent = await db.actionCode.count({ where: { userId: user.id, purpose, createdAt: { gte: new Date(Date.now() - 60_000) } } });
  if (recent >= 3) throw new Error("Trop de demandes. Patientez une minute.");
  await db.actionCode.updateMany({ where: { userId: user.id, purpose, usedAt: null }, data: { usedAt: new Date() } });
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const row = await db.actionCode.create({
    data: { userId: user.id, purpose, codeHash: hash(code), payload, expiresAt: new Date(Date.now() + TTL_MIN * 60_000) },
  });
  await sendEmail({ to: user.email, ...codeEmail(purpose, code, TTL_MIN, detail) });
  return row.id;
}

/** Vérifie et consomme le code. Renvoie la charge utile enregistrée. */
export async function consumeActionCode(userId: string, id: string, purpose: string, code: string) {
  const row = await db.actionCode.findFirst({ where: { id, userId, purpose } });
  if (!row || row.usedAt) return { ok: false as const, error: "Ce code n'est plus valide. Demandez-en un nouveau." };
  if (row.expiresAt < new Date()) return { ok: false as const, error: "Ce code a expiré. Demandez-en un nouveau." };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false as const, error: "Trop d'essais. Demandez un nouveau code." };
  const a = Buffer.from(row.codeHash);
  const b = Buffer.from(hash(code.trim()));
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await db.actionCode.update({ where: { id }, data: { attempts: { increment: 1 } } });
    return { ok: false as const, error: "Code incorrect. Vérifiez et réessayez." };
  }
  const used = await db.actionCode.updateMany({ where: { id, usedAt: null }, data: { usedAt: new Date() } });
  if (used.count !== 1) return { ok: false as const, error: "Ce code n'est plus valide." };
  return { ok: true as const, payload: row.payload };
}
