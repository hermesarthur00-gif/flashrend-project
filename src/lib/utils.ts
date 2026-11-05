import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const usd = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Espace insécable classique : l'espace fine insécable n'existe pas dans toutes les polices. */
const nbsp = (s: string) => s.replace(/\u202f/g, "\u00a0");

export function formatUSD(value: number) {
  return nbsp(usd.format(value));
}

export function formatPct(value: number, digits = 2) {
  const abs = Math.abs(value).toLocaleString("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${abs} %`;
}

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatEUR(value: number) {
  return nbsp(eur.format(value));
}

export function formatMoney(value: number, currency: "USD" | "EUR") {
  return currency === "EUR" ? formatEUR(value) : formatUSD(value);
}

export function formatQty(value: number, symbol: string) {
  const digits = value >= 1000 ? 2 : value >= 1 ? 4 : 6;
  return nbsp(`${value.toLocaleString("fr-FR", { maximumFractionDigits: digits })} ${symbol}`);
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
const dateShort = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "Europe/Paris" });
const dateTime = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

export const formatDate = (d: Date | string | number) => dateFmt.format(new Date(d));
export const formatDateShort = (d: Date | string | number) => dateShort.format(new Date(d));
export const formatDateTime = (d: Date | string | number) => dateTime.format(new Date(d));

export const PROFILE_LABELS = { CAREFUL: "Prudent", BALANCED: "Équilibré", BOLD: "Dynamique" } as const;
export const PROFILE_RISK = { CAREFUL: 2, BALANCED: 3, BOLD: 5 } as const;
export type ProfileKey = keyof typeof PROFILE_LABELS;

/** Date décalée de `days` jours par rapport à maintenant. */
export function daysAgo(days: number) {
  return new Date(Date.now() - days * 86400000);
}
