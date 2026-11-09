import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";
import { cn, formatPct, formatUSD } from "@/lib/utils";
import type { CryptoSymbol } from "@/lib/landing-data";

export const ASSETS: Record<CryptoSymbol, { name: string; glyph: string; color: string }> = {
  BTC: { name: "Bitcoin", glyph: "₿", color: "var(--crypto-btc)" },
  ETH: { name: "Ethereum", glyph: "Ξ", color: "var(--crypto-eth)" },
  BNB: { name: "BNB", glyph: "B", color: "var(--crypto-bnb)" },
  DOGE: { name: "Dogecoin", glyph: "Ð", color: "var(--crypto-doge)" },
  USDT: { name: "Tether", glyph: "₮", color: "var(--crypto-usdt)" },
  SOL: { name: "Solana", glyph: "S", color: "var(--crypto-sol)" },
};

export function CryptoIcon({ symbol, size = 36, className }: { symbol: CryptoSymbol; size?: number; className?: string }) {
  const a = ASSETS[symbol];
  return (
    <span
      aria-hidden="true"
      className={cn("inline-grid shrink-0 place-items-center rounded-full font-bold leading-none text-on-flash", className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.46), background: a.color }}
    >
      {a.glyph}
    </span>
  );
}

export function PriceChange({ value, soft = false, className }: { value: number; soft?: boolean; className?: string }) {
  const dir = value > 0 ? "up" : value < 0 ? "down" : "flat";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[3px] whitespace-nowrap text-[13px] leading-[18px] font-semibold tabular-nums",
        dir === "up" && "text-up",
        dir === "down" && "text-down",
        dir === "flat" && "text-ink-muted",
        soft && "rounded-xs px-2 py-0.5",
        soft && dir === "up" && "bg-up-soft",
        soft && dir === "down" && "bg-down-soft",
        className,
      )}
    >
      {dir === "up" && <IconArrowUpRight size={14} stroke={2.5} aria-hidden="true" />}
      {dir === "down" && <IconArrowDownRight size={14} stroke={2.5} aria-hidden="true" />}
      {formatPct(value)}
      <span className="sr-only">{dir === "up" ? " en hausse" : dir === "down" ? " en baisse" : " stable"}</span>
    </span>
  );
}

export function Sparkline({ data, width = 72, height = 28 }: { data: number[]; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data
    .map((v, i) => `${((i / (data.length - 1)) * width).toFixed(1)},${(height - 2 - ((v - min) / rng) * (height - 4)).toFixed(1)}`)
    .join(" ");
  const up = data[data.length - 1] >= data[0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="block shrink-0">
      <polyline points={pts} fill="none" stroke={up ? "var(--up)" : "var(--down)"} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function AssetRow({ symbol, value, change }: { symbol: CryptoSymbol; value: number; change: number }) {
  return (
    <div className="flex items-center gap-3 border-b border-line py-2.5">
      <CryptoIcon symbol={symbol} size={32} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5">{ASSETS[symbol].name}</span>
        <span className="block text-xs leading-4 text-ink-muted">{symbol}</span>
      </span>
      <span className="flex flex-col items-end">
        <span className="text-sm font-semibold tabular-nums">{formatUSD(value)}</span>
        <PriceChange value={change} />
      </span>
    </div>
  );
}

export function AllocationDonut({
  items,
  size = 148,
  centerLabel = "Actifs",
}: {
  items: { symbol: CryptoSymbol; value: number }[];
  size?: number;
  centerLabel?: string;
}) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const R = 52;
  const C = 2 * Math.PI * R;
  const segments = items.reduce<{ symbol: CryptoSymbol; value: number; len: number; off: number }[]>((acc, it) => {
    const prev = acc[acc.length - 1];
    const off = prev ? prev.off + prev.len : 0;
    acc.push({ ...it, len: (it.value / total) * C, off });
    return acc;
  }, []);
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 128 128" width={size} height={size} role="img" aria-label="Répartition du portefeuille" className="block">
          <circle cx={64} cy={64} r={R} fill="none" stroke="var(--surface-sunken)" strokeWidth={16} />
          {segments.map((s) => {
            const len = Math.max(0, s.len - 2);
            return (
              <circle
                key={s.symbol}
                cx={64}
                cy={64}
                r={R}
                fill="none"
                stroke={ASSETS[s.symbol].color}
                strokeWidth={16}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-s.off}
                transform="rotate(-90 64 64)"
                className="transition-[stroke-dasharray,stroke-dashoffset] duration-500 ease-out"
              />
            );
          })}
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center text-ink-muted">
          <span className="text-caption">{centerLabel}</span>
          <span className="text-[22px] leading-7 font-semibold text-ink">{items.length}</span>
        </span>
      </div>
      <ul className="m-0 min-w-40 flex-1 list-none p-0">
        {items.map((it) => (
          <li key={it.symbol} className="flex items-center gap-2 py-1.5 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: ASSETS[it.symbol].color }} />
            <span className="flex-1">{ASSETS[it.symbol].name}</span>
            <span className="text-amount-sm">{((it.value / total) * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })}&nbsp;%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BalanceCard({ amount, gain }: { amount: number; gain: number }) {
  return (
    <section aria-label="Solde total" className="rounded-lg bg-band p-4 text-on-band">
      <span className="text-overline text-flash">Solde total</span>
      <p className="mt-1.5 mb-1 text-[28px] leading-8 font-bold tracking-tight tabular-nums">{formatUSD(amount)}</p>
      <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-xs bg-flash px-1.5 py-0.5 font-semibold text-on-flash tabular-nums">
          <IconArrowUpRight size={14} stroke={2.5} aria-hidden="true" />+{formatUSD(gain)}
        </span>
        depuis le début
      </p>
    </section>
  );
}
