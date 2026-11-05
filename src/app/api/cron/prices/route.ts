import { revalidateTag } from "next/cache";
import { refreshPrices, PRICES_TAG } from "@/lib/server/prices";
import { snapshotAll } from "@/lib/server/portfolio";

/** Tâche planifiée (Vercel Cron) : cours à jour et valeur du jour de chaque portefeuille. */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Non autorisé", { status: 401 });
  }
  let prices = 0;
  try {
    prices = await refreshPrices();
    revalidateTag(PRICES_TAG, "max");
  } catch (e) {
    console.error("[cron] cours", e);
  }
  const portfolios = await snapshotAll();
  return Response.json({ prices, portfolios });
}
