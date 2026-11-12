"use server";
import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { getSettings } from "@/lib/server/settings";
import { notify, notifyAdmins } from "@/lib/server/notify";
import { uploadPrivate } from "@/lib/server/uploads";
import { formatMoney, formatEUR } from "@/lib/utils";

const METHOD_LABEL = { STANDARD: "virement classique", INSTANT: "virement instantané" } as const;

/** Le client déclare son virement : mode, devise, montant et preuve. */
export async function submitDeposit(form: FormData): Promise<{ error?: string }> {
  const user = await requireOnboardedUser();
  if (user.kycStatus !== "APPROVED") return { error: "Votre identité doit être vérifiée avant un dépôt." };
  const method = form.get("method") === "INSTANT" ? "INSTANT" : "STANDARD";
  const currency = "EUR" as const;
  const amount = Math.round(Number(String(form.get("amount") ?? "").replace(/\s/g, "").replace(",", ".")) * 100) / 100;
  const proof = form.get("proof");

  const settings = await getSettings();
  if (!settings.bank[currency].iban) return { error: "Les coordonnées bancaires ne sont pas encore disponibles." };
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Indiquez le montant viré." };
  if (amount < settings.money.depositMin) return { error: `Le dépôt minimum est de ${formatEUR(settings.money.depositMin)}.` };
  if (!(proof instanceof File) || proof.size === 0) return { error: "Ajoutez la preuve du virement." };

  const open = await db.deposit.count({ where: { userId: user.id, status: "ANNOUNCED" } });
  if (open >= 3) return { error: "Vous avez déjà 3 dépôts en vérification. Patientez jusqu'à leur traitement." };

  let proofId: string;
  try {
    proofId = await uploadPrivate(proof, `preuves/${user.id}`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Envoi de la preuve impossible." };
  }

  const deposit = await db.$transaction(async (tx) => {
    const d = await tx.deposit.create({ data: { userId: user.id, reference: user.reference!, currency, method, declaredAmount: amount, proofId } });
    await tx.activity.create({ data: { userId: user.id, type: "DEPOSIT", title: "Dépôt en vérification", subtitle: `${formatMoney(amount, currency)} · ${METHOD_LABEL[method]} · réf. ${user.reference}`, pending: true, href: `/account/depot/${d.id}` } });
    return d;
  });

  const delay = method === "INSTANT" ? settings.money.depositDelayInstant : settings.money.depositDelayStandard;
  await notify(user.id, { kind: "deposit", title: "Dépôt reçu, vérification en cours", body: `${formatMoney(amount, currency)} par ${METHOD_LABEL[method]}. Délai indicatif : ${delay}.`, url: `/account/depot/${deposit.id}` });
  await notifyAdmins({
    title: `Nouveau dépôt à vérifier : ${formatMoney(amount, currency)}`,
    lines: [`${user.firstName ?? ""} ${user.lastName ?? ""} (${user.email}) déclare un ${METHOD_LABEL[method]} de ${formatMoney(amount, currency)}.`, `Référence : ${user.reference}.`, "La preuve du virement est jointe au dépôt dans l'admin."],
    path: `/admin/depots?id=${deposit.id}`,
    cta: "Vérifier le dépôt",
  });
  redirect(`/account/depot/${deposit.id}`);
}
