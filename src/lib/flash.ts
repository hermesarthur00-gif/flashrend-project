/** Durée d'un investissement Flash. */
export const FLASH_HOURS = 24;
export const FLASH_MS = FLASH_HOURS * 3600 * 1000;

/** Gain d'un investissement Flash, arrondi au centime inférieur. */
export function flashGain(amount: number, ratePercent: number) {
  return Math.floor(((amount * ratePercent) / 100) * 100 + 1e-9) / 100;
}

/**
 * Progression du rendement affichée (0 au lancement, 1 à l'échéance) à la fraction `f` de la durée.
 * La courbe fluctue autour d'une progression régulière, de façon propre à chaque investissement (graine),
 * et rejoint toujours exactement le rendement fixé par l'offre à 24 h.
 */
export function flashProgress(seed: number, f: number) {
  const t = Math.min(1, Math.max(0, f));
  const r = (n: number) => {
    const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  let wave = 0;
  let weight = 0;
  for (let k = 0; k < 4; k++) {
    const a = 1 / (k + 1);
    wave += a * Math.sin(2 * Math.PI * (1.5 + r(k) * 3 + k * 2.2) * t + r(k + 10) * 2 * Math.PI);
    weight += a;
  }
  const envelope = Math.pow(Math.sin(Math.PI * t), 0.6);
  return Math.min(1, Math.max(0, t + 0.24 * envelope * (wave / weight)));
}
