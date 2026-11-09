import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";

export type MarketAsset = { symbol: string; name: string; priceUsd: number; change24h: number; priceAt: Date | null };

export const PRICES_TAG = "prices";

async function fetchCoinGecko(ids: string[]) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd&include_24hr_change=true`;
  const headers: Record<string, string> = { accept: "application/json" };
  if (process.env.COINGECKO_API_KEY) headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(6000), cache: "no-store" });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  return (await res.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
}

/** Met à jour les cours en base depuis CoinGecko. Sans réseau, les derniers cours connus restent en place. */
export async function refreshPrices() {
  const assets = await db.asset.findMany({ where: { active: true } });
  if (!assets.length) return 0;
  const data = await fetchCoinGecko(assets.map((a) => a.coingeckoId));
  const now = new Date();
  let updated = 0;
  for (const a of assets) {
    const p = data[a.coingeckoId];
    if (!p?.usd) continue;
    await db.asset.update({ where: { symbol: a.symbol }, data: { priceUsd: p.usd, change24h: p.usd_24h_change ?? 0, priceAt: now } });
    updated++;
  }
  return updated;
}

/** Cours actuels : rafraîchis toutes les 2 minutes au plus, sinon dernier cours connu. */
export async function getMarket(): Promise<MarketAsset[]> {
  "use cache";
  cacheTag(PRICES_TAG);
  cacheLife({ stale: 60, revalidate: 120, expire: 3600 });
  try {
    await refreshPrices();
  } catch (e) {
    console.warn("[prix] CoinGecko indisponible, derniers cours conservés.", e instanceof Error ? e.message : e);
  }
  try {
    const rows = await db.asset.findMany({ orderBy: { symbol: "asc" } });
    return rows.map((r) => ({ symbol: r.symbol, name: r.name, priceUsd: Number(r.priceUsd), change24h: Number(r.change24h), priceAt: r.priceAt }));
  } catch {
    return [];
  }
}

/** Historique de cours (30 jours) pour la page d'un actif. */
export async function getPriceHistory(coingeckoId: string, days = 30): Promise<{ t: number; v: number }[]> {
  "use cache";
  cacheLife("hours");
  try {
    const headers: Record<string, string> = { accept: "application/json" };
    if (process.env.COINGECKO_API_KEY) headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`, {
      headers,
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { prices?: [number, number][] };
    return (json.prices ?? []).map(([t, v]) => ({ t, v }));
  } catch {
    return [];
  }
}
