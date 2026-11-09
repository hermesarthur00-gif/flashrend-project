import { getMarket } from "@/lib/server/prices";
import { LivePricesProvider } from "./live-prices";

/** Fournit les cours (derniers connus côté serveur, puis flux en direct côté navigateur). */
export async function LiveRoot({ children }: { children: React.ReactNode }) {
  const market = await getMarket();
  const initial = Object.fromEntries(market.map((m) => [m.symbol, { price: m.priceUsd, change: m.change24h }]));
  return <LivePricesProvider initial={initial}>{children}</LivePricesProvider>;
}
