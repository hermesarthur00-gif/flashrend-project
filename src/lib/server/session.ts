import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { auth } from "./auth";
import { db } from "./db";
import { settleDueFlash } from "./flash";

export const getSession = cache(async () => {
  // Rendu à la demande : la session dépend de la requête (et Better Auth lit l'heure courante).
  await connection();
  return auth.api.getSession({ headers: await headers() });
});

/** Utilisateur connecté (données complètes), sinon redirection vers la connexion. */
export const requireUser = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/account/connexion");
  // Les investissements Flash arrivés à échéance sont versés avant d'afficher le solde.
  await settleDueFlash(session.user.id).catch(() => 0);
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/account/connexion");
  if (user.suspendedAt) redirect("/account/connexion?suspendu=1");
  return user;
});

/** Client ayant terminé l'accueil (identité envoyée, profil choisi). */
export async function requireOnboardedUser() {
  const user = await requireUser();
  if (user.kycStatus === "NONE" || user.kycStatus === "REJECTED") redirect("/account/verification");
  if (!user.profile) redirect("/account/profil");
  return user;
}

export const requireAdmin = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/account/connexion?next=/admin");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "ADMIN" || user.suspendedAt) notFound();
  return user;
});

export async function audit(actorId: string, action: string, target?: { type: string; id: string }, data?: Prisma.InputJsonValue) {
  await db.auditLog.create({ data: { actorId, action, targetType: target?.type, targetId: target?.id, data } });
}
