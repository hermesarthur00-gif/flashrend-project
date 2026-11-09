"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * Cours en temps réel, en euros.
 * Source : flux public de Binance (paires en USDT, mis à jour chaque seconde, sans clé),
 * convertis avec la paire EURUSDT (dollars pour 1 euro).
 * Secours : /api/prices (CoinGecko en euros, puis derniers cours connus) toutes les 30 secondes.
 */
export type LivePrice = { price: number; change: number };
type Prices = Record<string, LivePrice>;
type Ctx = { prices: Prices; live: boolean };

const LivePricesContext = createContext<Ctx>({ prices: {}, live: false });

const STABLE = new Set(["USDT", "USDC"]);
const WS_HOSTS = ["wss://data-stream.binance.vision", "wss://stream.binance.com:9443"];

type Tick = { c: number; o: number };

export function LivePricesProvider({ initial, children }: { initial: Prices; children: React.ReactNode }) {
  const [prices, setPrices] = useState<Prices>(initial);
  const [live, setLive] = useState(false);
  const ticks = useRef<Record<string, Tick>>({});
  const polled = useRef<Prices>({});
  const dirty = useRef(false);

  useEffect(() => {
    const all = Object.keys(initial);
    const symbols = all.filter((s) => !STABLE.has(s));
    if (!symbols.length) return;
    let ws: WebSocket | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let failures = 0;
    let closed = false;

    // Un seul rendu par seconde, avec conversion en euros dès que le cours EUR/USD est connu.
    const flush = setInterval(() => {
      if (Object.keys(polled.current).length) {
        const p = polled.current;
        polled.current = {};
        setPrices((cur) => ({ ...cur, ...p }));
      }
      if (!dirty.current) return;
      const eur = ticks.current.EUR;
      if (!eur) return;
      dirty.current = false;
      const next: Prices = {};
      for (const [sym, t] of Object.entries(ticks.current)) {
        if (sym === "EUR") continue;
        const price = t.c / eur.c;
        const open = t.o / eur.o;
        next[sym] = { price, change: open > 0 ? (price / open - 1) * 100 : 0 };
      }
      for (const s of all.filter((x) => STABLE.has(x))) {
        next[s] = { price: 1 / eur.c, change: (eur.o / eur.c - 1) * 100 };
      }
      setPrices((cur) => ({ ...cur, ...next }));
    }, 1000);

    function startPolling() {
      if (poll) return;
      const load = async () => {
        try {
          const res = await fetch("/api/prices", { cache: "no-store" });
          if (!res.ok) return;
          const rows = (await res.json()) as { symbol: string; priceEur: number; change24h: number }[];
          for (const r of rows) if (r.priceEur > 0) polled.current[r.symbol] = { price: r.priceEur, change: r.change24h };
        } catch {}
      };
      load();
      poll = setInterval(load, 30_000);
    }

    function connect() {
      if (closed) return;
      const host = WS_HOSTS[failures % WS_HOSTS.length];
      const streams = [...symbols, "EUR"].map((s) => `${s.toLowerCase()}usdt@miniTicker`).join("/");
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
          const c = Number(data.c);
          const o = Number(data.o);
          if (c > 0 && o > 0) {
            ticks.current[data.s.replace(/USDT$/, "")] = { c, o };
            dirty.current = true;
          }
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

    // Connexion après l'hydratation de la page.
    const start = setTimeout(connect, 1500);
    return () => {
      clearTimeout(start);
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
  return prices[symbol] ?? { price: 0, change: 0 };
}

export type Position = { symbol: string; name: string; quantity: number };

/** Valeur actuelle de chaque ligne et du total, en euros, aux cours en direct. */
export function useLiveHoldings(positions: Position[]) {
  const { prices } = useContext(LivePricesContext);
  const items = positions
    .map((p) => {
      const lp = prices[p.symbol] ?? { price: 0, change: 0 };
      return { ...p, priceEur: lp.price, change24h: lp.change, valueEur: p.quantity * lp.price, share: 0 };
    })
    .filter((h) => h.quantity > 0)
    .sort((a, b) => b.valueEur - a.valueEur);
  const total = items.reduce((s, h) => s + h.valueEur, 0);
  for (const h of items) h.share = total ? (h.valueEur / total) * 100 : 0;
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
