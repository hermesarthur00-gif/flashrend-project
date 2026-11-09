import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { getSettings } from "./settings";
import { feesSentence, orPlaceholder } from "../settings-schema";
import type { CryptoSymbol, ProfileId } from "../landing-data";
import { profiles as fallbackProfiles } from "../landing-data";

/** Informations publiques du site, gérées dans l'admin. Un repère entre crochets reste affiché tant qu'un champ est vide. */
export async function getPublicConfig() {
  const s = await getSettings();
  const l = s.legal;
  return {
    contact: {
      email: s.contact.email,
      phone: orPlaceholder(s.contact.phone, "[TÉLÉPHONE]"),
      address: orPlaceholder(s.contact.address, "[ADRESSE POSTALE]"),
    },
    legal: {
      companyName: orPlaceholder(l.companyName, "[RAISON SOCIALE]"),
      legalForm: orPlaceholder(l.legalForm, "[FORME JURIDIQUE]"),
      shareCapital: orPlaceholder(l.shareCapital, "[CAPITAL SOCIAL]"),
      address: orPlaceholder(l.address, "[ADRESSE DU SIÈGE]"),
      registration: orPlaceholder(l.registration, "[RCS VILLE ET NUMÉRO SIREN]"),
      vatNumber: orPlaceholder(l.vatNumber, "[N° DE TVA INTRACOMMUNAUTAIRE]"),
      director: orPlaceholder(l.director, "[DIRECTEUR DE LA PUBLICATION]"),
      host: orPlaceholder(l.host, "[HÉBERGEUR, ADRESSE ET TÉLÉPHONE]"),
      mediator: orPlaceholder(l.mediator, "[MÉDIATEUR DE LA CONSOMMATION]"),
      lastUpdated: l.lastUpdated,
    },
    withdrawalDelay: orPlaceholder(s.money.withdrawalDelay, "[DÉLAI DE RETRAIT]"),
    fees: feesSentence(s),
  };
}

const KEYS: Record<ProfileId, "CAREFUL" | "BALANCED" | "BOLD"> = { careful: "CAREFUL", balanced: "BALANCED", bold: "BOLD" };

/** Répartitions affichées sur le site, alignées sur celles de l'admin. */
export async function getPublicAllocations(): Promise<Record<ProfileId, { symbol: CryptoSymbol; value: number }[]>> {
  "use cache";
  cacheTag("allocations");
  cacheLife("hours");
  const out = {} as Record<ProfileId, { symbol: CryptoSymbol; value: number }[]>;
  try {
    const rows = await db.profileAllocation.findMany({ orderBy: { percent: "desc" } });
    for (const id of Object.keys(KEYS) as ProfileId[]) {
      const r = rows.filter((x) => x.profile === KEYS[id]).map((x) => ({ symbol: x.symbol as CryptoSymbol, value: Number(x.percent) }));
      out[id] = r.length ? r : fallbackProfiles[id].allocation;
    }
  } catch {
    for (const id of Object.keys(KEYS) as ProfileId[]) out[id] = fallbackProfiles[id].allocation;
  }
  return out;
}
