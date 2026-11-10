"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconBolt } from "@tabler/icons-react";
import { toast } from "sonner";
import { Alert, Card, InfoRow } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { FlashChart } from "@/components/live/flash-chart";
import { FLASH_HOURS, flashGain } from "@/lib/flash";
import { cn, formatEUR } from "@/lib/utils";
import { AmountInput, QuickAmounts } from "../investir/invest-form";
import { subscribeFlash } from "./actions";

type Offer = { id: string; name: string; ratePercent: number; min: number; max: number | null };
const parse = (v: string) => Number(v.replace(/\s/g, "").replace(",", ".")) || 0;
const rateText = (r: number) => `${r.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;

export function FlashForm({ cash, offers }: { cash: number; offers: Offer[] }) {
  const router = useRouter();
  const [offerId, setOfferId] = useState(offers[0].id);
  const [raw, setRaw] = useState("");
  const [pending, start] = useTransition();
  const offer = offers.find((o) => o.id === offerId) ?? offers[0];
  const amount = parse(raw);
  const cap = offer.max === null ? cash : Math.min(cash, offer.max);
  const tooLow = amount > 0 && amount < offer.min;
  const tooHigh = amount > cap + 0.001;
  const valid = amount > 0 && !tooLow && !tooHigh;
  // Aperçu : sans montant, on montre l'exemple du minimum de l'offre.
  const sample = amount > 0 ? amount : offer.min;
  const gain = flashGain(sample, offer.ratePercent);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await subscribeFlash({ offerId: offer.id, amount });
          if (res.error) toast.error(res.error);
          else {
            toast.success("Flash lancé", { description: `${formatEUR(amount)} bloqués pendant ${FLASH_HOURS} h.` });
            setRaw("");
            router.refresh();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
      }}
    >
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="text-label mb-2">Choisissez une offre</legend>
        {offers.map((o) => {
          const on = o.id === offer.id;
          return (
            <label key={o.id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4", on ? "border-ink bg-flash-soft" : "border-line bg-surface-raised hover:border-line-strong")}>
              <input type="radio" name="offer" value={o.id} checked={on} onChange={() => setOfferId(o.id)} className="sr-only" />
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-md", on ? "bg-flash text-on-flash" : "bg-surface-sunken")}>
                <IconBolt size={22} stroke={2} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{o.name}</span>
                <span className="block text-sm text-ink-muted">
                  Dès {formatEUR(o.min)}
                  {o.max !== null && ` · jusqu'à ${formatEUR(o.max)}`}
                </span>
              </span>
              <span className="text-right">
                <span className="text-amount block text-xl tabular-nums text-up">+{rateText(o.ratePercent)}</span>
                <span className="block text-xs text-ink-muted">en {FLASH_HOURS} h</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="flex items-center justify-between rounded-lg bg-surface-sunken px-4 py-3.5">
        <span className="text-sm text-ink-muted">Solde disponible</span>
        <span className="text-amount tabular-nums">{formatEUR(cash)}</span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="flash-amount" className="text-label">
          Montant à bloquer
        </label>
        <AmountInput id="flash-amount" value={raw} onChange={setRaw} invalid={tooLow || tooHigh} />
        <QuickAmounts max={cap} onPick={(v) => setRaw(v)} />
        <p className={cn("m-0 text-sm", tooLow || tooHigh ? "text-down" : "text-ink-muted")}>
          {tooHigh ? `Maximum ${formatEUR(cap)}.` : `Minimum ${formatEUR(offer.min)}${offer.max !== null ? `, maximum ${formatEUR(offer.max)}` : ""}.`}
        </p>
      </div>

      <Card>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-caption m-0 text-ink-muted">{amount > 0 ? "Rendement possible" : `Exemple avec ${formatEUR(offer.min)}`}</p>
            <p className="text-amount-lg m-0 tabular-nums text-up">+{formatEUR(gain)}</p>
          </div>
          <div className="text-right">
            <p className="text-caption m-0 text-ink-muted">Total à l&apos;échéance</p>
            <p className="text-amount m-0 text-lg tabular-nums">{formatEUR(sample + gain)}</p>
          </div>
        </div>
        <FlashChart amount={sample} gain={gain} />
      </Card>

      <div>
        <InfoRow label="Durée" value={`${FLASH_HOURS} h`} />
        <InfoRow label="Rendement" value={rateText(offer.ratePercent)} />
        <InfoRow label="Frais" value="Aucun" />
        <InfoRow label="Solde disponible après" value={formatEUR(Math.max(0, cash - amount))} />
      </div>

      <Alert tone="info" title="Montant bloqué pendant 24 h">
        Vous ne pouvez pas récupérer ce montant avant l&apos;échéance. Le rendement affiché est celui de l&apos;offre au moment où vous la lancez : il ne change pas ensuite.{" "}
        <Link href="/risques" className="underline underline-offset-2">
          Comprendre les risques
        </Link>
      </Alert>
      <Button type="submit" size="lg" block disabled={pending || !valid}>
        {pending ? "Lancement…" : valid ? `Bloquer ${formatEUR(amount)} pendant 24 h` : "Lancer le Flash"}
      </Button>
    </form>
  );
}
