"use client";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";
import { cn, formatUSD } from "@/lib/utils";
import { LiveDot, useLiveHoldings, useLivePrice, type Position } from "./live-prices";

type Point = { t: number; v: number };
type Range = "24 h" | "7 j" | "1 m" | "3 m";
const RANGES: Range[] = ["24 h", "7 j", "1 m", "3 m"];
const STABLE = new Set(["USDT", "USDC"]);
const KLINES: Record<Range, { interval: string; limit: number }> = {
  "24 h": { interval: "15m", limit: 96 },
  "7 j": { interval: "2h", limit: 84 },
  "1 m": { interval: "12h", limit: 60 },
  "3 m": { interval: "1d", limit: 90 },
};
const DAYS: Record<Range, number> = { "24 h": 1, "7 j": 7, "1 m": 30, "3 m": 90 };

/** Heure courante, rafraîchie chaque seconde (pour le point « maintenant » des courbes). */
const subscribeClock = (cb: () => void) => {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
};
const clockSnapshot = () => Math.floor(Date.now() / 1000) * 1000;
function useNow() {
  return useSyncExternalStore(subscribeClock, clockSnapshot, () => 0);
}

/** Historique de cours (clôtures) depuis l'API publique de Binance. */
async function klines(symbol: string, range: Range): Promise<Point[]> {
  const { interval, limit } = KLINES[range];
  const res = await fetch(`https://data-api.binance.vision/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`);
  if (!res.ok) throw new Error(String(res.status));
  const rows = (await res.json()) as [number, string, string, string, string][];
  return rows.map((r) => ({ t: r[0], v: Number(r[4]) }));
}

const fmtTime = (t: number, range: Range) =>
  new Intl.DateTimeFormat("fr-FR", range === "24 h" ? { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" } : { day: "numeric", month: "short", hour: range === "7 j" ? "2-digit" : undefined, timeZone: "Europe/Paris" }).format(t);

function Svg({ data, label, height, live }: { data: Point[]; label: string; height: number; live: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const min = Math.min(...data.map((p) => p.v));
  const max = Math.max(...data.map((p) => p.v));
  const rng = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - 8 - ((v - min) / rng) * (H - 16);
  const line = data.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const up = live >= data[0].v;
  const color = up ? "var(--up)" : "var(--down)";
  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        className="block w-full touch-none"
        style={{ height }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.max(0, Math.min(data.length - 1, Math.round(((e.clientX - r.left) / r.width) * (data.length - 1)))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <polygon points={`0,${H} ${line} ${W},${H}`} fill={color} opacity={0.08} />
        <polyline points={line} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={0} y2={H} stroke="var(--line-strong)" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
      </svg>
      {/* Point du cours actuel, en bout de courbe */}
      <span className="pointer-events-none absolute right-0 size-2.5 translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full" style={{ top: `${(y(data[data.length - 1].v) / H) * 100}%`, background: color }} aria-hidden="true" />
      {hover !== null && (
        <span className="pointer-events-none absolute top-0 rounded-xs bg-band px-2 py-1 text-xs font-semibold text-on-band tabular-nums" style={{ left: `clamp(0px, calc(${(hover / (data.length - 1)) * 100}% - 60px), calc(100% - 120px))` }}>
          {formatUSD(data[hover].v)}
        </span>
      )}
    </div>
  );
}

function Header({ value, first, range, setRange, title }: { value: number; first: number | null; range: Range; setRange: (r: Range) => void; title?: string }) {
  const diff = first === null ? 0 : value - first;
  const pct = first ? (diff / first) * 100 : 0;
  const up = diff >= 0;
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        {title && <p className="text-caption m-0 text-ink-muted">{title}</p>}
        <p className="text-amount-lg m-0 tabular-nums">{formatUSD(value)}</p>
        <p className={cn("m-0 inline-flex items-center gap-1 text-sm font-semibold tabular-nums", up ? "text-up" : "text-down")}>
          {up ? <IconArrowUpRight size={16} stroke={2.5} aria-hidden="true" /> : <IconArrowDownRight size={16} stroke={2.5} aria-hidden="true" />}
          {up ? "+" : "−"}
          {formatUSD(Math.abs(diff))} ({up ? "+" : "−"}
          {Math.abs(pct).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %)
          <span className="font-normal text-ink-muted">sur {range}</span>
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <LiveDot />
        <div role="tablist" aria-label="Période" className="flex rounded-md bg-surface-sunken p-0.5">
          {RANGES.map((r) => (
            <button key={r} role="tab" type="button" aria-selected={range === r} onClick={() => setRange(r)} className={cn("h-8 rounded-sm px-2.5 text-sm font-semibold", range === r ? "bg-surface-raised text-ink" : "text-ink-muted")}>
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Empty({ height, text }: { height: number; text: string }) {
  return (
    <div className="grid place-items-center rounded-md bg-surface-sunken px-4 text-center text-sm text-ink-muted" style={{ height }}>
      {text}
    </div>
  );
}

/** Courbe d'un actif : historique Binance + cours en direct. */
export function AssetLiveChart({ symbol, name, fallback, height = 180 }: { symbol: string; name: string; fallback: Point[]; height?: number }) {
  const [range, setRange] = useState<Range>("24 h");
  const [loaded, setLoaded] = useState<{ range: Range; data: Point[] } | null>(null);
  const live = useLivePrice(symbol).price;
  const now = useNow();

  useEffect(() => {
    if (STABLE.has(symbol)) return;
    let cancel = false;
    klines(symbol, range)
      .then((d) => !cancel && setLoaded({ range, data: d }))
      .catch(() => {
        const from = Date.now() - DAYS[range] * 86400000;
        if (!cancel) setLoaded({ range, data: fallback.filter((p) => p.t >= from) });
      });
    return () => {
      cancel = true;
    };
  }, [symbol, range, fallback]);

  const base = loaded?.range === range ? loaded.data : null;
  const data = base && base.length ? [...base.slice(0, -1), { t: now || base[base.length - 1].t, v: live || base[base.length - 1].v }] : null;
  return (
    <figure className="m-0 flex flex-col gap-3">
      <Header value={live} first={data?.[0]?.v ?? null} range={range} setRange={setRange} title={`Cours de ${name}`} />
      {STABLE.has(symbol) ? <Empty height={height} text="Stablecoin : son cours suit le dollar." /> : data && data.length > 1 ? <Svg data={data} label={`Cours de ${name}, ${range}`} height={height} live={live} /> : <Empty height={height} text={base === null ? "Chargement de l'historique…" : "Historique indisponible pour le moment."} />}
      {data && data.length > 1 && <p className="text-caption m-0 text-ink-muted">Depuis {fmtTime(data[0].t, range)}</p>}
    </figure>
  );
}

/**
 * Gain sur la période, hors argent ajouté ou retiré : valeur actuelle − valeur de départ − (investi − désinvesti pendant la période).
 * Sur 24 h, la valeur de départ est reconstituée avec les quantités actuelles : chaque investissement de la période
 * est retiré de ce départ, au prorata de l'évolution des cours depuis son exécution.
 */
function periodGain(range: Range, data: Point[], flows: Point[], now: number, intraday: Point[] | null) {
  const t0 = data[0].t;
  if (range === "24 h") {
    const inRange = flows.filter((f) => f.t > t0);
    const series = intraday ?? data;
    const at = (t: number) => series.reduce((best, p) => (Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best), series[0]).v || 1;
    const start = data[0].v - inRange.reduce((s, f) => s + (f.v * data[0].v) / at(f.t), 0);
    const added = inRange.reduce((s, f) => s + f.v, 0);
    const gain = now - start - added;
    return { gain, base: Math.max(0, start) + Math.max(0, added) };
  }
  // Relevé du jour de départ : il inclut déjà les opérations de ce jour-là.
  const nextDay = new Date(t0).setHours(24, 0, 0, 0);
  const inRange = flows.filter((f) => f.t >= nextDay);
  const added = inRange.reduce((s, f) => s + f.v, 0);
  return { gain: now - data[0].v - added, base: Math.max(0, data[0].v) + Math.max(0, added) };
}

function GainLine({ label, gain, base }: { label: string; gain: number; base: number }) {
  const up = gain >= 0;
  const pct = base > 0 ? (gain / base) * 100 : 0;
  return (
    <p className="m-0 flex flex-wrap items-center gap-x-1.5 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className={cn("inline-flex items-center gap-0.5 font-semibold tabular-nums", up ? "text-up" : "text-down")}>
        {up ? <IconArrowUpRight size={16} stroke={2.5} aria-hidden="true" /> : <IconArrowDownRight size={16} stroke={2.5} aria-hidden="true" />}
        {up ? "+" : "−"}
        {formatUSD(Math.abs(gain))}
        {base > 0 && ` (${up ? "+" : "−"}${Math.abs(pct).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %)`}
      </span>
    </p>
  );
}

/**
 * Courbe de valeur d'un portefeuille (ou de l'encours) : 24 h reconstituées à partir des cours,
 * 7 j / 1 m / 3 m à partir des relevés quotidiens, dernier point en direct.
 * En-tête : valeur investie, gain sur la période choisie et gain depuis le début.
 */
export function PortfolioLiveChart({ positions, daily, flows = [], investedNet, title, height = 170 }: { positions: Position[]; daily: Point[]; flows?: Point[]; investedNet?: number; title: string; height?: number }) {
  const [range, setRange] = useState<Range>("24 h");
  const [intraday, setIntraday] = useState<Point[] | null>(null);
  const { total } = useLiveHoldings(positions);
  const now = useNow();
  const key = positions.map((p) => `${p.symbol}:${p.quantity}`).join("|");

  useEffect(() => {
    if (range !== "24 h") return;
    let cancel = false;
    const held = positions.filter((p) => p.quantity > 0);
    Promise.all(held.map((p) => (STABLE.has(p.symbol) ? Promise.resolve(null) : klines(p.symbol, "24 h").catch(() => null))))
      .then((series) => {
        if (cancel) return;
        const ref = series.find((s) => s && s.length);
        if (!ref) return setIntraday([]);
        const points = ref.map((pt, i) => ({
          t: pt.t,
          v: held.reduce((sum, p, j) => sum + p.quantity * (STABLE.has(p.symbol) ? 1 : (series[j]?.[i]?.v ?? series[j]?.at(-1)?.v ?? 0)), 0),
        }));
        setIntraday(points);
      });
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, key]);

  const data = useMemo(() => {
    if (range === "24 h") return intraday && intraday.length ? [...intraday.slice(0, -1), { t: now, v: total }] : null;
    const from = now - DAYS[range] * 86400000;
    const today = new Date(now).setHours(0, 0, 0, 0);
    const d = daily.filter((p) => p.t >= from && p.t < today);
    return [...d, { t: now, v: total }];
  }, [range, intraday, daily, total, now]);

  const period = data && data.length > 1 ? periodGain(range, data, flows, total, intraday) : null;
  const empty = positions.every((p) => p.quantity <= 0);
  return (
    <figure className="m-0 flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-caption m-0 text-ink-muted">{title}</p>
          <p className="text-amount-lg m-0 tabular-nums">{formatUSD(total)}</p>
          {!empty && period && <GainLine label={`Gain sur ${range}`} gain={period.gain} base={period.base} />}
          {!empty && investedNet !== undefined && <GainLine label="Depuis le début" gain={total - investedNet} base={investedNet} />}
        </div>
        <div className="flex flex-col items-end gap-2">
          <LiveDot />
          <div role="tablist" aria-label="Période" className="flex rounded-md bg-surface-sunken p-0.5">
            {RANGES.map((r) => (
              <button key={r} role="tab" type="button" aria-selected={range === r} onClick={() => setRange(r)} className={cn("h-8 rounded-sm px-2.5 text-sm font-semibold", range === r ? "bg-surface-raised text-ink" : "text-ink-muted")}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
      {empty ? (
        <Empty height={height} text="Rien d'investi pour l'instant. La courbe démarre avec votre premier investissement." />
      ) : data && data.length > 1 ? (
        <Svg data={data} label={`${title}, ${range}`} height={height} live={total} />
      ) : (
        <Empty height={height} text={range === "24 h" ? (intraday === null ? "Chargement…" : "Historique des dernières 24 h indisponible pour le moment.") : "La courbe se remplit jour après jour."} />
      )}
    </figure>
  );
}
