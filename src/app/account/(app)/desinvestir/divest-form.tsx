"use client";
import { useState, useTransition } from "react";
import { IconCircleCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { Alert, InfoRow } from "@/components/app/primitives";
import { Button, ButtonLink } from "@/components/ui/button";
import { LiveDot, useLiveHoldings, type Position } from "@/components/live/live-prices";
import { cn, formatEUR } from "@/lib/utils";
import { AmountInput, QuickAmounts } from "../investir/invest-form";
import { divestNow } from "../investir/actions";

const parse = (v: string) => Number(v.replace(/\s/g, "").replace(",", ".")) || 0;

export function DivestForm({ cash, positions }: { cash: number; positions: Position[] }) {
  const { total } = useLiveHoldings(positions);
  const [raw, setRaw] = useState("");
  const [all, setAll] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const amount = parse(raw);
  const tooHigh = !all && amount > total + 0.005;

  if (done !== null)
    return (
      <div className="flex flex-col gap-6 pt-6 text-center">
        <span className="mx-auto grid size-24 place-items-center rounded-full bg-flash text-on-flash">
          <IconCircleCheck size={56} stroke={1.5} />
        </span>
        <div>
          <h1 className="text-h1 m-0 mb-2">Ajouté à votre solde</h1>
          <p className="m-0 text-ink-muted">
            <strong className="text-ink">{formatEUR(done)}</strong> sont disponibles. Vous pouvez les retirer vers votre banque ou les réinvestir.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <ButtonLink href="/account/retrait" size="lg" block>
            Retirer vers ma banque
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
          const res = await divestNow({ amount, all });
          if (res.error) toast.error(res.error);
          else if (res.amount) setDone(res.amount);
        });
      }}
    >
      <div className="flex items-center justify-between rounded-lg bg-surface-sunken px-4 py-3.5">
        <span className="flex flex-col">
          <span className="text-sm text-ink-muted">Valeur investie</span>
          <LiveDot />
        </span>
        <span className="text-amount tabular-nums">{formatEUR(total)}</span>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="divest" className="text-label">
          Montant à désinvestir
        </label>
        <AmountInput
          id="divest"
          value={raw}
          onChange={(v) => {
            setRaw(v);
            setAll(false);
          }}
          invalid={tooHigh}
        />
        <QuickAmounts
          max={total}
          onPick={(v, a) => {
            setRaw(v);
            setAll(a);
          }}
        />
        {tooHigh && <p className={cn("m-0 text-sm text-down")}>Maximum {formatEUR(total)}.</p>}
      </div>
      <div>
        <InfoRow label="Frais" value="Aucun" />
        <InfoRow label="Solde disponible après" value={formatEUR(cash + (all ? total : amount))} />
      </div>
      <Alert tone="info" title="Revendu sur chaque crypto, en proportion">
        Le montant est revendu en proportion de chaque crypto détenue, aux cours du moment, puis ajouté à votre solde disponible.
      </Alert>
      <Button type="submit" size="lg" block disabled={pending || !amount || tooHigh}>
        {pending ? "Un instant…" : amount ? `Désinvestir ${formatEUR(all ? total : amount)}` : "Désinvestir"}
      </Button>
    </form>
  );
}
