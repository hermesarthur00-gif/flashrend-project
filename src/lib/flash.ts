/** Durée d'un investissement Flash. */
export const FLASH_HOURS = 24;
export const FLASH_MS = FLASH_HOURS * 3600 * 1000;

/** Gain d'un investissement Flash, arrondi au centime inférieur. */
export function flashGain(amount: number, ratePercent: number) {
  return Math.floor(((amount * ratePercent) / 100) * 100 + 1e-9) / 100;
}
