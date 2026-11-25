import Link from "next/link";
import { IconArrowBackUp, IconArrowDownLeft, IconArrowUpRight, IconArrowsExchange, IconChartPie, IconUserCog, IconChevronRight, IconBolt } from "@tabler/icons-react";
import { CryptoIcon, PriceChange } from "@/components/ui/finance";
import type { CryptoSymbol } from "@/lib/landing-data";
import { cn, formatDateShort, formatQty, formatEUR } from "@/lib/utils";
import { Badge, IconTile } from "@/components/app/primitives";

export const KNOWN = ["BTC", "ETH", "BNB", "DOGE", "USDT", "SOL"];

export function AssetIcon({ symbol, size = 36 }: { symbol: string; size?: number }) {
  if (KNOWN.includes(symbol)) return <CryptoIcon symbol={symbol as CryptoSymbol} size={size} />;
  return (
    <span aria-hidden="true" className="grid shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-flash" style={{ width: size, height: size }}>
      {symbol.slice(0, 3)}
    </span>
  );
}

export function assetColor(symbol: string) {
  return KNOWN.includes(symbol) ? `var(--crypto-${symbol.toLowerCase()})` : "var(--ink-muted)";
}

export function HoldingRow({ h, href }: { h: { symbol: string; name: string; quantity: number; valueEur: number; change24h: number }; href?: string }) {
  const inner = (
    <>
      <AssetIcon symbol={h.symbol} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] leading-5 font-semibold">{h.name}</span>
        <span className="block text-xs leading-4 text-ink-muted tabular-nums">{formatQty(h.quantity, h.symbol)}</span>
      </span>
      <span className="flex flex-col items-end">
        <span className="text-amount-sm text-[15px]">{formatEUR(h.valueEur)}</span>
        <PriceChange value={h.change24h} />
      </span>
      {href && <IconChevronRight size={18} stroke={1.75} className="text-ink-muted" aria-hidden="true" />}
    </>
  );
  const cls = "flex items-center gap-3 border-b border-line py-3 last:border-b-0";
  return href ? (
    <Link href={href} className={cn(cls, "-mx-2 rounded-md px-2 text-ink hover:bg-surface-sunken")}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

const ACT = {
  DEPOSIT: { Icon: IconArrowDownLeft, tone: "info" as const, sign: "+" },
  INVEST: { Icon: IconChartPie, tone: "soft" as const, sign: "" },
  DIVEST: { Icon: IconArrowBackUp, tone: "sunken" as const, sign: "" },
  WITHDRAW: { Icon: IconArrowUpRight, tone: "sunken" as const, sign: "−" },
  REBALANCE: { Icon: IconArrowsExchange, tone: "soft" as const, sign: "" },
  PROFILE: { Icon: IconUserCog, tone: "sunken" as const, sign: "" },
  FLASH: { Icon: IconBolt, tone: "flash" as const, sign: "" },
  REFUND: { Icon: IconArrowBackUp, tone: "sunken" as const, sign: "" },
};

export type ActivityItem = { id: string; type: keyof typeof ACT; title: string; subtitle: string | null; amountEur: number | null; pending: boolean; href?: string | null; createdAt: Date };

export function ActivityList({ items }: { items: ActivityItem[] }) {
  if (!items.length) return <p className="m-0 py-4 text-ink-muted">Aucune opération pour le moment.</p>;
  return (
    <ul data-stagger className="m-0 list-none p-0">
      {items.map((a) => {
        const t = ACT[a.type];
        const body = (
          <>
            <IconTile tone={t.tone}>
              <t.Icon size={20} stroke={1.75} />
            </IconTile>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] leading-5 font-semibold">{a.title}</span>
              <span className="block truncate text-xs leading-4 text-ink-muted">
                {formatDateShort(a.createdAt)}
                {a.subtitle ? ` · ${a.subtitle}` : ""}
              </span>
            </span>
            <span className="flex flex-col items-end gap-0.5">
              {a.amountEur !== null && (
                <span className={cn("text-amount-sm text-[15px]", a.type === "DEPOSIT" && !a.pending && "text-up")}>
                  {t.sign}
                  {formatEUR(a.amountEur)}
                </span>
              )}
              {a.pending && <Badge tone="warning">En attente</Badge>}
            </span>
            {a.href && <IconChevronRight size={18} stroke={1.75} className="shrink-0 text-ink-muted" aria-hidden="true" />}
          </>
        );
        return (
          <li key={a.id} className="border-b border-line last:border-b-0">
            {a.href ? (
              <Link href={a.href} className="-mx-2 flex items-center gap-3 rounded-md px-2 py-3 text-ink hover:bg-surface-sunken">
                {body}
              </Link>
            ) : (
              <div className="flex items-center gap-3 py-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function toActivity(rows: { id: string; type: string; title: string; subtitle: string | null; amountEur: unknown; pending: boolean; href?: string | null; createdAt: Date }[]): ActivityItem[] {
  return rows.map((r) => ({ ...r, type: r.type as ActivityItem["type"], amountEur: r.amountEur === null ? null : Number(r.amountEur) }));
}
