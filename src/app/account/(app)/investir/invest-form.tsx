"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { IconCircleCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { Alert, Card, Glyph, InfoRow } from "@/components/app/primitives";
import { Button, ButtonLink } from "@/components/ui/button";
import { AssetIcon } from "@/components/account/widgets";
import { LiveDot, useLivePrices } from "@/components/live/live-prices";
import { PROFILE_LABELS, cn, formatQty, formatUSD, type ProfileKey } from "@/lib/utils";
import { investNow } from "./actions";

const parse = (v: string) => Number(v.replace(/\s/g, "").replace(",", ".")) || 0;

export function AmountInput({ id, value, onChange, invalid }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 border-b-2 border-ink pb-1">
      <input id={id} inputMode="decimal" autoComplete="off" placeholder="0" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.,\s]/g, ""))} className="text-amount-xl w-full min-w-0 bg-transparent outline-none placeholder:text-ink-muted/50" aria-invalid={invalid || undefined} />
      <span className="text-h2 text-ink-muted">$</span>
    </div>
  );
}

export function QuickAmounts({ max, onPick }: { max: number; onPick: (v: string, all: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {[0.25, 0.5, 1].map((r) => (
        <button key={r} type="button" onClick={() => onPick(String(Math.floor(max * r * 100) / 100).replace(".", ","), r === 1)} className="h-9 rounded-full border border-line-strong px-3.5 text-sm font-semibold hover:bg-surface-sunken">
          {r === 1 ? "Tout" : `${r * 100} %`}
        </button>
      ))}
    </div>
  );
}

export function InvestForm({ cash, min, profile, allocation }: { cash: number; min: number; profile: ProfileKey; allocation: { symbol: string; name: string; percent: number }[] }) {
  const [raw, setRaw] = useState("");
  const [all, setAll] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const { prices } = useLivePrices();
  const amount = parse(raw);
  const tooLow = amount > 0 && amount < min;
  const tooHigh = amount > cash + 0.001;

  if (done !== null)
    return (
      <div className="flex flex-col gap-6 pt-4">
        <div className="relative grid h-[200px] place-items-center">
          <Glyph name="eth" size={60} rotate={-14} className="top-4 left-8" />
          <Glyph name="btc" size={52} rotate={12} className="right-10 bottom-6" />
          <span className="grid size-24 place-items-center rounded-full bg-flash text-on-flash">
            <IconCircleCheck size={56} stroke={1.5} />
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-h1 m-0 mb-2">C&apos;est investi</h1>
          <p className="m-0 text-ink-muted">
            <strong className="text-ink">{formatUSD(done)}</strong> répartis selon votre profil {PROFILE_LABELS[profile].toLowerCase()}. Suivez leur valeur en direct dans votre portefeuille.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <ButtonLink href="/account/portefeuille" size="lg" block>
            Voir mon portefeuille
          </ButtonLink>
          <ButtonLink href="/account" variant="ghost" size="lg" block>
            Retour à l&apos;accueil
          </ButtonLink>
        </div>
      </div>
    );

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await investNow({ amount, all });
          if (res.error) toast.error(res.error);
          else if (res.amount) setDone(res.amount);
        });
      }}
    >
      <div className="flex items-center justify-between rounded-lg bg-surface-sunken px-4 py-3.5">
        <span className="text-sm text-ink-muted">Solde disponible</span>
        <span className="text-amount tabular-nums">{formatUSD(cash)}</span>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="invest" className="text-label">
          Montant à investir
        </label>
        <AmountInput
          id="invest"
          value={raw}
          onChange={(v) => {
            setRaw(v);
            setAll(false);
          }}
          invalid={tooLow || tooHigh}
        />
        <QuickAmounts
          max={cash}
          onPick={(v, a) => {
            setRaw(v);
            setAll(a);
          }}
        />
        <p className={cn("m-0 text-sm", tooLow || tooHigh ? "text-down" : "text-ink-muted")}>{tooHigh ? `Maximum ${formatUSD(cash)}.` : `Minimum ${formatUSD(min)}.`}</p>
      </div>
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-h3 m-0">Répartition {PROFILE_LABELS[profile].toLowerCase()}</h2>
          <LiveDot />
        </div>
        {allocation.map((a) => {
          const usd = (amount * a.percent) / 100;
          const price = a.symbol === "USDT" ? 1 : (prices[a.symbol]?.price ?? 0);
          return (
            <div key={a.symbol} className="flex items-center gap-3 border-t border-line py-2.5 first:border-t-0">
              <AssetIcon symbol={a.symbol} size={30} />
              <span className="flex flex-1 flex-col">
                <span className="text-[15px] font-semibold">
                  {a.name} <span className="font-normal text-ink-muted">{a.percent.toLocaleString("fr-FR")} %</span>
                </span>
                {amount > 0 && price > 0 && <span className="text-xs text-ink-muted tabular-nums">≈ {formatQty(usd / price, a.symbol)}</span>}
              </span>
              <span className="font-semibold tabular-nums">{formatUSD(usd)}</span>
            </div>
          );
        })}
      </Card>
      <div>
        <InfoRow label="Frais" value="Aucun" />
        <InfoRow label="Solde disponible après" value={formatUSD(Math.max(0, cash - amount))} />
      </div>
      <Alert tone="warning" title="La valeur peut baisser">
        Les cryptos sont achetées aux cours du moment. Leur valeur varie ensuite, à la hausse comme à la baisse.{" "}
        <Link href="/risques" className="underline underline-offset-2">
          Comprendre les risques
        </Link>
      </Alert>
      <Button type="submit" size="lg" block disabled={pending || !amount || tooLow || tooHigh}>
        {pending ? "Investissement…" : amount ? `Investir ${formatUSD(amount)}` : "Investir"}
      </Button>
    </form>
  );
}
