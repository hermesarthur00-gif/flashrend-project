"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { executionPrices, rebalanceUser } from "@/lib/server/portfolio";
import { notify } from "@/lib/server/notify";
import type { ProfileId } from "@/generated/prisma/client";
import { PROFILE_LABELS } from "@/lib/utils";

export async function chooseProfile(profile: ProfileId) {
  const user = await requireUser();
  if (!["CAREFUL", "BALANCED", "BOLD"].includes(profile)) return { error: "Profil inconnu." };
  if (user.kycStatus === "NONE") return { error: "Commencez par la vérification d'identité." };
  if (user.profile === profile) redirect("/account");

  const first = !user.profile;
  const pm = await executionPrices();
  const moved = await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { profile, profileSetAt: new Date() } });
    const value = first ? 0 : await rebalanceUser(tx, user.id, profile, pm);
    await tx.activity.create({
      data: { userId: user.id, type: "PROFILE", title: first ? `Profil ${PROFILE_LABELS[profile].toLowerCase()} choisi` : `Passage au profil ${PROFILE_LABELS[profile].toLowerCase()}`, subtitle: value > 0 ? "Portefeuille réparti à nouveau" : null },
    });
    return value;
  });
  if (moved > 0) await notify(user.id, { kind: "rebalance", title: "Profil modifié", body: `Votre portefeuille suit désormais le profil ${PROFILE_LABELS[profile]}.`, url: "/account/portefeuille" });
  redirect("/account");
}
