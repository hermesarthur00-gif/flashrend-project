import { z } from "zod";
import { siteConfig } from "./site-config";

const bankSchema = z.object({
  beneficiary: z.string().trim().max(120).default(""),
  iban: z.string().trim().max(64).default(""),
  swift: z.string().trim().max(20).default(""),
  bankName: z.string().trim().max(120).default(""),
  bankAddress: z.string().trim().max(200).default(""),
});

export const settingsSchema = z.object({
  contact: z.object({
    email: z.string().trim().email().default(siteConfig.contact.email),
    phone: z.string().trim().max(40).default(""),
    address: z.string().trim().max(200).default(""),
  }),
  legal: z.object({
    companyName: z.string().trim().max(120).default(""),
    legalForm: z.string().trim().max(80).default(""),
    shareCapital: z.string().trim().max(80).default(""),
    address: z.string().trim().max(200).default(""),
    registration: z.string().trim().max(120).default(""),
    vatNumber: z.string().trim().max(40).default(""),
    director: z.string().trim().max(120).default(""),
    host: z.string().trim().max(200).default(""),
    mediator: z.string().trim().max(200).default(""),
    lastUpdated: z.string().trim().max(40).default(siteConfig.legal.lastUpdated),
  }),
  bank: z.object({ USD: bankSchema, EUR: bankSchema }),
  money: z.object({
    managementFee: z.string().trim().max(80).default(""),
    depositFee: z.string().trim().max(80).default(""),
    withdrawalFeeUsd: z.coerce.number().min(0).max(1000).default(0),
    depositMinUsd: z.coerce.number().min(0).max(100000).default(50),
    withdrawalMinUsd: z.coerce.number().min(0).max(100000).default(20),
    eurUsdRate: z.coerce.number().min(0.1).max(10).default(1.08),
    depositDelayStandard: z.string().trim().max(80).default("1 à 3 jours ouvrés"),
    depositDelayInstant: z.string().trim().max(80).default("quelques minutes à quelques heures"),
    investMinUsd: z.coerce.number().min(0).max(100000).default(10),
    withdrawalDelay: z.string().trim().max(80).default(""),
    kycDelay: z.string().trim().max(80).default(""),
  }),
});

export type Settings = z.infer<typeof settingsSchema>;

const emptyBank = { beneficiary: "", iban: "", swift: "", bankName: "", bankAddress: "" };

export const DEFAULT_SETTINGS: Settings = {
  contact: { email: siteConfig.contact.email, phone: "", address: "" },
  legal: { companyName: "", legalForm: "", shareCapital: "", address: "", registration: "", vatNumber: "", director: "", host: "", mediator: "", lastUpdated: siteConfig.legal.lastUpdated },
  bank: { USD: emptyBank, EUR: emptyBank },
  money: { managementFee: "", depositFee: "", withdrawalFeeUsd: 0, depositMinUsd: 50, withdrawalMinUsd: 20, eurUsdRate: 1.08, depositDelayStandard: "1 à 3 jours ouvrés", depositDelayInstant: "quelques minutes à quelques heures", investMinUsd: 10, withdrawalDelay: "", kycDelay: "" },
};

/** Fusionne une valeur stockée avec les valeurs par défaut (champs ajoutés plus tard). */
export function mergeSettings(raw: unknown): Settings {
  const r = (raw ?? {}) as Partial<Settings>;
  const d = DEFAULT_SETTINGS;
  return {
    contact: { ...d.contact, ...r.contact },
    legal: { ...d.legal, ...r.legal },
    bank: { USD: { ...d.bank.USD, ...r.bank?.USD }, EUR: { ...d.bank.EUR, ...r.bank?.EUR } },
    money: { ...d.money, ...r.money },
  };
}

/** Texte de remplacement visible tant que l'admin n'a pas renseigné le champ. */
export const orPlaceholder = (value: string, placeholder: string) => (value.trim() ? value : placeholder);

/** Phrase de frais affichée sur le site public. */
export function feesSentence(s: Settings) {
  const parts: string[] = [];
  if (s.money.managementFee) parts.push(`Frais de gestion : ${s.money.managementFee}`);
  if (s.money.depositFee) parts.push(`frais de dépôt : ${s.money.depositFee}`);
  parts.push(`frais de retrait : ${s.money.withdrawalFeeUsd > 0 ? `${s.money.withdrawalFeeUsd.toLocaleString("fr-FR")} $` : "aucun"}`);
  const t = parts.join(", ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}
