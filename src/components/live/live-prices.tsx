"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * Cours en temps réel.
 * Source : flux public de Binance (paires en USDT, mis à jour chaque seconde, sans clé).
 * Secours : /api/prices (CoinGecko, puis derniers cours connus) toutes les 30 secondes.
 */
export type LivePrice = { price: number; change: number };
type Prices = Record<string, LivePrice>;
type Ctx = { prices: Prices; live: boolean };

const LivePricesContext = createContext<Ctx>({ prices: {}, live: false });

const STABLE = new Set(["USDT", "USDC"]);
const WS_HOSTS = ["wss://data-stream.binance.vision", "wss://stream.binance.com:9443"];

export function LivePricesProvider({ initial, children }: { initial: Prices; children: React.ReactNode }) {
  const [prices, setPrices] = useState<Prices>(initial);
  const [live, setLive] = useState(false);
  const buffer = useRef<Prices>({});

  useEffect(() => {
    const symbols = Object.keys(initial).filter((s) => !STABLE.has(s));
    if (!symbols.length) return;
    let ws: WebSocket | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let failures = 0;
    let closed = false;

    // Les ticks arrivent par paquets : un seul rendu par seconde.
    const flush = setInterval(() => {
      const pending = buffer.current;
      if (!Object.keys(pending).length) return;
      buffer.current = {};
      setPrices((p) => ({ ...p, ...pending }));
    }, 1000);

    function startPolling() {
      if (poll) return;
      const load = async () => {
        try {
          const res = await fetch("/api/prices", { cache: "no-store" });
          if (!res.ok) return;
          const rows = (await res.json()) as { symbol: string; priceUsd: number; change24h: number }[];
          for (const r of rows) if (r.priceUsd > 0) buffer.current[r.symbol] = { price: r.priceUsd, change: r.change24h };
        } catch {}
      };
      load();
      poll = setInterval(load, 30_000);
    }

    function connect() {
      if (closed) return;
      const host = WS_HOSTS[failures % WS_HOSTS.length];
      const streams = symbols.map((s) => `${s.toLowerCase()}usdt@miniTicker`).join("/");
      ws = new WebSocket(`${host}/stream?streams=${streams}`);
      ws.onopen = () => {
        failures = 0;
        setLive(true);
        if (poll) {
          clearInterval(poll);
          poll = null;
        }
      };
      ws.onmessage = (ev) => {
        try {
          const { data } = JSON.parse(ev.data as string) as { data: { s: string; c: string; o: string } };
          const symbol = data.s.replace(/USDT$/, "");
          const price = Number(data.c);
          const open = Number(data.o);
          if (price > 0) buffer.current[symbol] = { price, change: open > 0 ? ((price - open) / open) * 100 : 0 };
        } catch {}
      };
      ws.onclose = () => {
        setLive(false);
        if (closed) return;
        failures++;
        if (failures >= 2) startPolling();
        retry = setTimeout(connect, Math.min(30_000, 2000 * failures));
      };
      ws.onerror = () => ws?.close();
    }

    connect();
    return () => {
      closed = true;
      clearInterval(flush);
      if (poll) clearInterval(poll);
      if (retry) clearTimeout(retry);
      ws?.close();
    };
    // Abonnement fixé au montage : la liste des cryptos ne change pas en cours de visite.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LivePricesContext.Provider value={{ prices, live }}>{children}</LivePricesContext.Provider>;
}

export function useLivePrices() {
  return useContext(LivePricesContext);
}

export function useLivePrice(symbol: string): LivePrice {
  const { prices } = useContext(LivePricesContext);
  if (STABLE.has(symbol)) return prices[symbol] ?? { price: 1, change: 0 };
  return prices[symbol] ?? { price: 0, change: 0 };
}

export type Position = { symbol: string; name: string; quantity: number };

/** Valeur actuelle de chaque ligne et du total, aux cours en direct. */
export function useLiveHoldings(positions: Position[]) {
  const { prices } = useContext(LivePricesContext);
  const items = positions
    .map((p) => {
      const lp = STABLE.has(p.symbol) ? (prices[p.symbol] ?? { price: 1, change: 0 }) : (prices[p.symbol] ?? { price: 0, change: 0 });
      return { ...p, priceUsd: lp.price, change24h: lp.change, valueUsd: p.quantity * lp.price, share: 0 };
    })
    .filter((h) => h.quantity > 0)
    .sort((a, b) => b.valueUsd - a.valueUsd);
  const total = items.reduce((s, h) => s + h.valueUsd, 0);
  for (const h of items) h.share = total ? (h.valueUsd / total) * 100 : 0;
  return { items, total };
}

/** Pastille « En direct » quand le flux est connecté. */
export function LiveDot() {
  const { live } = useContext(LivePricesContext);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted" title={live ? "Cours en temps réel" : "Cours actualisés toutes les 30 s"}>
      <span className={live ? "size-2 animate-pulse rounded-full bg-up-fill" : "size-2 rounded-full bg-line-strong"} aria-hidden="true" />
      {live ? "En direct" : "Actualisé"}
    </span>
  );
}
