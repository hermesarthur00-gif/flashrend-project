import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { DEFAULT_SETTINGS, mergeSettings, type Settings } from "../settings-schema";

export const SETTINGS_TAG = "settings";

/** Réglages du site (contact, mentions légales, coordonnées bancaires, frais). */
export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("hours");
  try {
    const row = await db.siteSettings.findUnique({ where: { id: "site" } });
    return mergeSettings(row?.data);
  } catch {
    return DEFAULT_SETTINGS;
  }
}
