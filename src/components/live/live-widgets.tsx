"use client";
import Link from "next/link";
import { IconArrowDownRight, IconArrowUpRight, IconChevronRight, IconPlus, IconChartPie, IconBuildingBank } from "@tabler/icons-react";
import { AllocationDonut, PriceChange } from "@/components/ui/finance";
import { ButtonLink } from "@/components/ui/button";
import { Stripes } from "@/components/ui/decor";
import { AssetIcon } from "@/components/account/widgets";
import type { CryptoSymbol } from "@/lib/landing-data";
import { cn, formatQty, formatEUR } from "@/lib/utils";
import { useLiveHoldings, useLivePrice, type Position } from "./live-prices";

export function Gain({ value, className }: { value: number; className?: string }) {
  const up = value >= 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 whitespace-nowrap font-semibold tabular-nums", up ? "text-up" : "text-down", className)}>
      {up ? <IconArrowUpRight size={16} stroke={2.5} aria-hidden="true" /> : <IconArrowDownRight size={16} stroke={2.5} aria-hidden="true" />}
      {up ? "+" : "−"}
      {formatEUR(Math.abs(value))}
    </span>
  );
}

/** Solde : disponible + investi (en direct), gain des investissements, actions. */
export function LiveBalanceCard({ cash, positions, investedNet, actions = true }: { cash: number; positions: Position[]; investedNet: number; actions?: boolean }) {
  const { total: invested } = useLiveHoldings(positions);
  const gain = invested - investedNet;
  const up = gain >= 0;
  return (
    <section aria-label="Solde" className="relative overflow-hidden rounded-lg bg-band p-5 text-on-band lg:p-6">
      <div className="pointer-events-none absolute -top-1.5 -right-1.5">
        <Stripes count={4} height={64} />
      </div>
      <span className="text-overline relative text-flash">Solde total</span>
      <p className="text-amount-xl relative m-0 mt-1.5 mb-2 tabular-nums">{formatEUR(cash + invested)}</p>
      <p className="relative m-0 flex flex-wrap items-center gap-2 text-xs">
        <span className={cn("inline-flex items-center gap-0.5 rounded-xs px-1.5 py-0.5 font-semibold tabular-nums", up ? "bg-up-fill text-ink-inverse" : "bg-down-fill text-on-down")}>
          {up ? <IconArrowUpRight size={14} stroke={2.5} aria-hidden="true" /> : <IconArrowDownRight size={14} stroke={2.5} aria-hidden="true" />}
          {up ? "+" : "−"}
          {formatEUR(Math.abs(gain))}
        </span>
        sur vos investissements
      </p>
      <dl className="relative m-0 mt-4 grid grid-cols-2 gap-3 border-t border-on-band/15 pt-3.5">
        <div>
          <dt className="text-caption opacity-75">Disponible</dt>
          <dd className="m-0 text-[17px] font-bold tabular-nums">{formatEUR(cash)}</dd>
        </div>
        <div>
          <dt className="text-caption opacity-75">Investi</dt>
          <dd className="m-0 text-[17px] font-bold tabular-nums">{formatEUR(invested)}</dd>
        </div>
      </dl>
      {actions && (
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <ButtonLink href="/account/investir" variant="primary" className="min-w-0 gap-1.5 px-1.5 text-sm sm:text-[15px]">
            <IconChartPie size={18} stroke={2} className="hidden min-[360px]:block" /> Investir
          </ButtonLink>
          <ButtonLink href="/account/depot" variant="secondary" className="min-w-0 gap-1.5 border-transparent px-1.5 text-sm sm:text-[15px]">
            <IconPlus size={18} stroke={2} className="hidden min-[360px]:block" /> Déposer
          </ButtonLink>
          <ButtonLink href="/account/retrait" variant="secondary" className="min-w-0 gap-1.5 border-transparent px-1.5 text-sm sm:text-[15px]">
            <IconBuildingBank size={18} stroke={2} className="hidden min-[360px]:block" /> Retirer
          </ButtonLink>
        </div>
      )}
    </section>
  );
}

/** Lignes d'actifs avec valeur et variation en direct. */
export function LiveHoldingRows({ positions, linked = true, empty }: { positions: Position[]; linked?: boolean; empty?: React.ReactNode }) {
  const { items } = useLiveHoldings(positions);
  if (!items.length) return <>{empty}</>;
  return (
    <>
      {items.map((h) => {
        const inner = (
          <>
            <AssetIcon symbol={h.symbol} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] leading-5 font-semibold">{h.name}</span>
              <span className="block text-xs leading-4 text-ink-muted tabular-nums">{formatQty(h.quantity, h.symbol)}</span>
            </span>
            <span className="flex flex-col items-end">
              <span className="text-amount-sm text-[15px] tabular-nums">{formatEUR(h.valueEur)}</span>
              <PriceChange value={h.change24h} />
            </span>
            {linked && <IconChevronRight size={18} stroke={1.75} className="text-ink-muted" aria-hidden="true" />}
          </>
        );
        const cls = "flex items-center gap-3 border-b border-line py-3 last:border-b-0";
        return linked ? (
          <Link key={h.symbol} href={`/account/portefeuille/${h.symbol.toLowerCase()}`} className={cn(cls, "-mx-2 rounded-md px-2 text-ink hover:bg-surface-sunken")}>
            {inner}
          </Link>
        ) : (
          <div key={h.symbol} className={cls}>
            {inner}
          </div>
        );
      })}
    </>
  );
}

export function LiveAllocation({ positions, size }: { positions: Position[]; size?: number }) {
  const { items } = useLiveHoldings(positions);
  return <AllocationDonut items={items.map((h) => ({ symbol: h.symbol as CryptoSymbol, value: h.valueEur }))} size={size} />;
}

export function LiveInvested({ positions, investedNet }: { positions: Position[]; investedNet: number }) {
  const { total } = useLiveHoldings(positions);
  return (
    <>
      <p className="text-amount m-0 mt-1 text-lg tabular-nums">{formatEUR(total)}</p>
      <Gain value={total - investedNet} className="text-sm" />
    </>
  );
}

/** Détention d'un actif (page de l'actif). */
export function LiveAssetHolding({ position }: { position: Position }) {
  const { items, total } = useLiveHoldings([position]);
  const h = items[0];
  const lp = useLivePrice(position.symbol);
  return (
    <div className="relative flex min-w-0 flex-col gap-0.5 pr-14">
      <span className="text-caption text-flash">VOUS DÉTENEZ</span>
      <span className="text-amount-lg tabular-nums">{formatEUR(total)}</span>
      <span className="text-[13px] tabular-nums opacity-80">
        {formatQty(h?.quantity ?? 0, position.symbol)} · 1 {position.symbol} = {formatEUR(lp.price)}
      </span>
    </div>
  );
}

export function LivePriceRow({ symbol }: { symbol: string }) {
  const lp = useLivePrice(symbol);
  return (
    <>
      <div className="flex justify-between gap-3 border-t border-line py-3 text-[15px] first:border-t-0">
        <span className="text-ink-muted">Cours actuel</span>
        <span className="font-semibold tabular-nums">{formatEUR(lp.price)}</span>
      </div>
      <div className="flex justify-between gap-3 border-t border-line py-3 text-[15px]">
        <span className="text-ink-muted">Variation 24 h</span>
        <PriceChange value={lp.change} />
      </div>
    </>
  );
}

/** Encours total en direct (admin). */
export function LiveAum({ quantities, cash }: { quantities: { symbol: string; quantity: number }[]; cash: number }) {
  const { total } = useLiveHoldings(quantities.map((q) => ({ ...q, name: q.symbol })));
  return <>{formatEUR(total + cash)}</>;
}

/** Gain en direct des investissements (admin). */
export function LiveGain({ positions, investedNet }: { positions: Position[]; investedNet: number }) {
  const { total } = useLiveHoldings(positions);
  return (
    <>
      <Gain value={total - investedNet} /> depuis le début
    </>
  );
}
