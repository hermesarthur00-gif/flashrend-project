import { config } from "dotenv";
config({ path: [".env.local", ".env"], quiet: true });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type ProfileId } from "../src/generated/prisma/client";
import { DEFAULT_SETTINGS } from "../src/lib/settings-schema";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Cours de départ en euros : remplacés au premier rafraîchissement CoinGecko.
const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", coingeckoId: "bitcoin", priceEur: 66597.0 },
  { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum", priceEur: 3118.9 },
  { symbol: "USDT", name: "Tether", coingeckoId: "tether", priceEur: 0.926 },
  { symbol: "SOL", name: "Solana", coingeckoId: "solana", priceEur: 170.8 },
  { symbol: "BNB", name: "BNB", coingeckoId: "binancecoin", priceEur: 566.9 },
  { symbol: "DOGE", name: "Dogecoin", coingeckoId: "dogecoin", priceEur: 0.152 },
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
