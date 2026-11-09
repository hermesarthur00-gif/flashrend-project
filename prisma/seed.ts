import { config } from "dotenv";
config({ path: [".env.local", ".env"], quiet: true });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type ProfileId } from "../src/generated/prisma/client";
import { DEFAULT_SETTINGS } from "../src/lib/settings-schema";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Cours de départ : remplacés au premier rafraîchissement CoinGecko.
const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", coingeckoId: "bitcoin", priceUsd: 71924.73 },
  { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum", priceUsd: 3368.4 },
  { symbol: "USDT", name: "Tether", coingeckoId: "tether", priceUsd: 1 },
  { symbol: "SOL", name: "Solana", coingeckoId: "solana", priceUsd: 184.48 },
  { symbol: "BNB", name: "BNB", coingeckoId: "binancecoin", priceUsd: 612.3 },
  { symbol: "DOGE", name: "Dogecoin", coingeckoId: "dogecoin", priceUsd: 0.1642 },
];

const ALLOCATIONS: Record<ProfileId, [string, number][]> = {
  CAREFUL: [["USDT", 60], ["BTC", 30], ["ETH", 10]],
  BALANCED: [["BTC", 45], ["ETH", 25], ["USDT", 20], ["SOL", 10]],
  BOLD: [["BTC", 40], ["ETH", 30], ["SOL", 20], ["BNB", 10]],
};

async function main() {
  for (const a of ASSETS) {
    await db.asset.upsert({ where: { symbol: a.symbol }, create: { ...a, priceAt: null }, update: { name: a.name, coingeckoId: a.coingeckoId } });
  }
  for (const [profile, rows] of Object.entries(ALLOCATIONS) as [ProfileId, [string, number][]][]) {
    const existing = await db.profileAllocation.count({ where: { profile } });
    if (existing) continue;
    for (const [symbol, percent] of rows) await db.profileAllocation.create({ data: { profile, symbol, percent } });
  }
  await db.siteSettings.upsert({ where: { id: "site" }, create: { id: "site", data: DEFAULT_SETTINGS }, update: {} });
  console.log("Seed terminé.");
}

main().finally(() => db.$disconnect());
