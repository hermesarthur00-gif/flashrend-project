import { connection } from "next/server";
import { getMarket } from "@/lib/server/prices";

/** Cours de secours pour l'app quand le flux temps réel est indisponible. */
export async function GET() {
  await connection();
  const market = await getMarket();
  return Response.json(market.map((m) => ({ symbol: m.symbol, priceUsd: m.priceUsd, change24h: m.change24h })), { headers: { "cache-control": "public, max-age=30" } });
}
