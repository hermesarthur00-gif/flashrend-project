"use client";
import { useMemo, useState } from "react";
import { cn, formatDate, formatUSD } from "@/lib/utils";

const RANGES = [
  { key: "7 j", days: 7 },
  { key: "1 m", days: 30 },
  { key: "3 m", days: 90 },
] as const;

/** Courbe de valeur avec sélection de période et lecture au survol. */
export function ValueChart({ series, label, height = 160, defaultRange = "1 m" }: { series: { t: number; v: number }[]; label: string; height?: number; defaultRange?: (typeof RANGES)[number]["key"] }) {
  const [range, setRange] = useState<string>(defaultRange);
  const [hover, setHover] = useState<number | null>(null);
  const days = RANGES.find((r) => r.key === range)?.days ?? 30;

  const data = useMemo(() => {
    if (!series.length) return [];
    const last = series[series.length - 1].t;
    const from = last - days * 86400000;
    const d = series.filter((p) => p.t >= from);
    return d.length >= 2 ? d : series.slice(-2);
  }, [series, days]);

  const W = 600;
  const H = height;
  if (data.length < 2) {
    return (
      <div className="grid place-items-center rounded-md bg-surface-sunken text-center text-sm text-ink-muted" style={{ height }}>
        La courbe apparaîtra après quelques jours de placement.
      </div>
    );
  }
  const min = Math.min(...data.map((p) => p.v));
  const max = Math.max(...data.map((p) => p.v));
  const rng = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - 8 - ((v - min) / rng) * (H - 16);
  const line = data.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const up = data[data.length - 1].v >= data[0].v;
  const color = up ? "var(--up)" : "var(--down)";
  const shown = hover !== null ? data[hover] : data[data.length - 1];
  const diff = shown.v - data[0].v;

  return (
    <figure className="m-0 flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-amount-lg m-0">{formatUSD(shown.v)}</p>
          <p className="m-0 text-xs text-ink-muted">
            <span className={cn("font-semibold tabular-nums", diff >= 0 ? "text-up" : "text-down")}>
              {diff >= 0 ? "+" : "−"}
              {formatUSD(Math.abs(diff))}
            </span>{" "}
            · {formatDate(shown.t)}
          </p>
        </div>
        <div role="tablist" aria-label="Période" className="flex rounded-md bg-surface-sunken p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              role="tab"
              type="button"
              aria-selected={range === r.key}
              onClick={() => setRange(r.key)}
              className={cn("h-8 rounded-sm px-3 text-sm font-semibold", range === r.key ? "bg-surface-raised text-ink" : "text-ink-muted")}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>
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
    </figure>
  );
}
