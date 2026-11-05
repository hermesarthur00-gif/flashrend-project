import "server-only";
import type { Prisma, ProfileId } from "@/generated/prisma/client";
import { db } from "./db";
import { getMarket, type MarketAsset } from "./prices";

type Tx = Prisma.TransactionClient;
export type PriceMap = Map<string, MarketAsset>;

export async function priceMap(): Promise<PriceMap> {
  const market = await getMarket();
  return new Map(market.map((m) => [m.symbol, m]));
}

export async function getAllocation(profile: ProfileId, client: Tx | typeof db = db) {
  const rows = await client.profileAllocation.findMany({ where: { profile }, orderBy: { percent: "desc" } });
  return rows.map((r) => ({ symbol: r.symbol, percent: Number(r.percent) }));
}

export type Holding = { symbol: string; name: string; quantity: number; priceUsd: number; valueUsd: number; change24h: number; share: number };

export async function getHoldings(userId: string, prices?: PriceMap) {
  const pm = prices ?? (await priceMap());
  const positions = await db.position.findMany({ where: { userId } });
  const items: Holding[] = positions
    .map((p) => {
      const m = pm.get(p.symbol);
      const quantity = Number(p.quantity);
      const priceUsd = m?.priceUsd ?? 0;
      return { symbol: p.symbol, name: m?.name ?? p.symbol, quantity, priceUsd, valueUsd: quantity * priceUsd, change24h: m?.change24h ?? 0, share: 0 };
    })
    .filter((h) => h.quantity > 0)
    .sort((a, b) => b.valueUsd - a.valueUsd);
  const total = items.reduce((s, h) => s + h.valueUsd, 0);
  for (const h of items) h.share = total ? (h.valueUsd / total) * 100 : 0;
  return { items, total };
}

/** Synthèse du portefeuille : valeur, montant net déposé, gain. */
export async function getPortfolioSummary(userId: string, prices?: PriceMap) {
  const [{ items, total }, dep, wd] = await Promise.all([
    getHoldings(userId, prices),
    db.deposit.aggregate({ where: { userId, status: "INVESTED" }, _sum: { creditedUsd: true } }),
    db.withdrawal.aggregate({ where: { userId, status: { not: "REJECTED" } }, _sum: { amountUsd: true, feeUsd: true } }),
  ]);
  const deposited = Number(dep._sum.creditedUsd ?? 0);
  const withdrawn = Number(wd._sum.amountUsd ?? 0) + Number(wd._sum.feeUsd ?? 0);
  const netInvested = deposited - withdrawn;
  return { items, total, deposited, withdrawn, netInvested, gain: total - netInvested, gainPct: netInvested > 0 ? ((total - netInvested) / netInvested) * 100 : 0 };
}

/** Achète pour `usd` dollars selon la répartition du profil, aux cours actuels. */
export async function investUsd(tx: Tx, userId: string, usd: number, profile: ProfileId, pm: PriceMap) {
  const alloc = await getAllocation(profile, tx);
  if (!alloc.length) throw new Error("Répartition du profil introuvable.");
  for (const a of alloc) {
    const price = pm.get(a.symbol)?.priceUsd;
    if (!price) throw new Error(`Cours indisponible pour ${a.symbol}.`);
    const qty = (usd * a.percent) / 100 / price;
    await tx.position.upsert({
      where: { userId_symbol: { userId, symbol: a.symbol } },
      create: { userId, symbol: a.symbol, quantity: qty.toFixed(12) },
      update: { quantity: { increment: qty.toFixed(12) } },
    });
  }
}

/** Vend `usd` dollars proportionnellement à chaque ligne. Renvoie la valeur avant vente. */
export async function sellUsd(tx: Tx, userId: string, usd: number, pm: PriceMap) {
  const positions = await tx.position.findMany({ where: { userId } });
  const total = positions.reduce((s, p) => s + Number(p.quantity) * (pm.get(p.symbol)?.priceUsd ?? 0), 0);
  if (usd > total + 0.005) throw new Error("Montant supérieur au solde disponible.");
  const keep = total > 0 ? Math.max(0, 1 - usd / total) : 0;
  for (const p of positions) {
    const q = keep < 1e-9 ? 0 : Number(p.quantity) * keep;
    await tx.position.update({ where: { id: p.id }, data: { quantity: q.toFixed(12) } });
  }
  return total;
}

/** Revend tout et rachète selon la répartition actuelle du profil. Renvoie la valeur réinvestie. */
export async function rebalanceUser(tx: Tx, userId: string, profile: ProfileId, pm: PriceMap) {
  const positions = await tx.position.findMany({ where: { userId } });
  const total = positions.reduce((s, p) => s + Number(p.quantity) * (pm.get(p.symbol)?.priceUsd ?? 0), 0);
  if (total <= 0) return 0;
  await tx.position.updateMany({ where: { userId }, data: { quantity: 0 } });
  await investUsd(tx, userId, total, profile, pm);
  return total;
}

/** Enregistre la valeur du jour (courbe du portefeuille). */
export async function snapshotUser(userId: string, pm?: PriceMap) {
  const { total } = await getHoldings(userId, pm);
  const day = new Date(new Date().toISOString().slice(0, 10));
  await db.portfolioSnapshot.upsert({
    where: { userId_day: { userId, day } },
    create: { userId, day, valueUsd: total.toFixed(2) },
    update: { valueUsd: total.toFixed(2) },
  });
}

export async function snapshotAll() {
  const pm = await priceMap();
  const users = await db.position.findMany({ where: { quantity: { gt: 0 } }, distinct: ["userId"], select: { userId: true } });
  for (const u of users) await snapshotUser(u.userId, pm);
  return users.length;
}

export async function getSnapshots(userId: string, days = 90) {
  const since = new Date(Date.now() - days * 86400000);
  const rows = await db.portfolioSnapshot.findMany({ where: { userId, day: { gte: since } }, orderBy: { day: "asc" } });
  return rows.map((r) => ({ t: r.day.getTime(), v: Number(r.valueUsd) }));
}

/** Valeur totale gérée (tous clients). */
export async function getAum(pm?: PriceMap) {
  const p = pm ?? (await priceMap());
  const sums = await db.position.groupBy({ by: ["symbol"], _sum: { quantity: true } });
  return sums.reduce((s, r) => s + Number(r._sum.quantity ?? 0) * (p.get(r.symbol)?.priceUsd ?? 0), 0);
}
