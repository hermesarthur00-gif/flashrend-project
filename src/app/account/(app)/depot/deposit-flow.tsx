"use client";
import { useState, useTransition } from "react";
import { IconChevronLeft, IconShare } from "@tabler/icons-react";
import { toast } from "sonner";
import Link from "next/link";
import { Alert, Card, Glyph, InfoRow } from "@/components/app/primitives";
import { CopyButton } from "@/components/app/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { announceDeposit } from "./actions";

type Bank = { beneficiary: string; iban: string; swift: string; bankName: string; bankAddress: string };
type Cur = "USD" | "EUR";

const CURRENCIES: Record<Cur, { sym: string; name: string; note: string }> = {
  USD: { sym: "$", name: "Dollar", note: "Placé tel quel sur votre profil" },
  EUR: { sym: "€", name: "Euro", note: "Converti en dollars à réception" },
};

function Head({ title, onBack, backHref }: { title: string; onBack?: () => void; backHref?: string }) {
  const cls = "grid size-11 place-items-center rounded-md hover:bg-ink/8";
  return (
    <header className="flex h-14 items-center gap-2 px-2 lg:px-0">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Retour" className={cls}>
          <IconChevronLeft size={22} stroke={1.75} />
        </button>
      ) : (
        <Link href={backHref ?? "/account"} aria-label="Retour" className={cls}>
          <IconChevronLeft size={22} stroke={1.75} />
        </Link>
      )}
      <h1 className="m-0 flex-1 text-center text-[17px] leading-6 font-bold lg:text-left lg:text-h2">{title}</h1>
      <span className="w-11" />
    </header>
  );
}

function CopyRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", highlight ? "mt-1 rounded-md bg-flash p-3 text-on-flash" : "border-t border-line py-3 first:border-t-0")}>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={cn("text-caption", highlight ? "text-on-flash" : "text-ink-muted")}>{label}</span>
        <span className="text-[15px] font-bold [overflow-wrap:anywhere] tabular-nums">{value}</span>
      </div>
      <CopyButton value={value} label={label} />
    </div>
  );
}

export function DepositFlow({ reference, banks, minLabel, delay, eurRate }: { reference: string; banks: Partial<Record<Cur, Bank>>; minLabel: string | null; delay: string; eurRate: number }) {
  const available = Object.keys(banks) as Cur[];
  const [currency, setCurrency] = useState<Cur>(available[0]);
  const [step, setStep] = useState<"currency" | "bank">("currency");
  const [pending, start] = useTransition();
  const bank = banks[currency]!;

  if (step === "currency") {
    return (
      <>
        <Head title="Déposer" backHref="/account" />
        <div className="flex flex-col gap-3.5 px-4 pt-2 pb-6 lg:px-0">
          <div className="relative pr-16">
            <h2 className="text-h2 m-0 mb-1.5 max-w-[16ch]">Dans quelle devise virez-vous ?</h2>
            <p className="m-0 text-ink-muted">Les dépôts se font par virement bancaire, depuis un compte à votre nom.</p>
            <Glyph name="btc" size={56} rotate={12} className="-top-1.5 right-0" />
          </div>
          <div role="radiogroup" aria-label="Devise" className="flex flex-col gap-3">
            {available.map((c) => {
              const sel = c === currency;
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setCurrency(c)}
                  className={cn("flex w-full items-center gap-3.5 rounded-lg p-4 text-left text-ink", sel ? "border-2 border-ink bg-flash-soft" : "border border-line bg-surface-raised")}
                >
                  <span className="grid size-12 place-items-center rounded-full bg-ink text-[22px] font-bold text-ink-inverse">{CURRENCIES[c].sym}</span>
                  <span className="flex flex-1 flex-col">
                    <span className="text-[17px] font-bold">
                      {CURRENCIES[c].name} <span className="font-semibold text-ink-muted">{c}</span>
                    </span>
                    <span className="text-sm text-ink-muted">{CURRENCIES[c].note}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {minLabel && (
            <Alert tone="info" title="Dépôt minimum">
              {minLabel} par virement.
            </Alert>
          )}
          <Button size="lg" block className="mt-2" onClick={() => setStep("bank")}>
            Voir les coordonnées
          </Button>
        </div>
      </>
    );
  }

  const shareText = `Virement FlashInv\nBénéficiaire : ${bank.beneficiary}\nIBAN : ${bank.iban}\nBIC / SWIFT : ${bank.swift}\nBanque : ${bank.bankName}\nRéférence : ${reference}`;

  return (
    <>
      <Head title={`Virement en ${currency}`} onBack={() => setStep("currency")} />
      <div className="flex flex-col gap-4 px-4 pt-1 pb-6 lg:px-0">
        <p className="m-0 text-ink-muted">Depuis votre banque, faites un virement vers ce compte, puis confirmez ci-dessous.</p>
        <Card>
          <CopyRow label="Bénéficiaire" value={bank.beneficiary} />
          <CopyRow label={currency === "EUR" ? "IBAN" : "IBAN / numéro de compte"} value={bank.iban} />
          {bank.swift && <CopyRow label="BIC / SWIFT" value={bank.swift} />}
          {bank.bankName && <CopyRow label="Banque" value={bank.bankName} />}
          {bank.bankAddress && <CopyRow label="Adresse de la banque" value={bank.bankAddress} />}
          <CopyRow label="Référence à indiquer" value={reference} highlight />
        </Card>
        <Alert tone="warning" title="N'oubliez pas la référence">
          Sans elle, nous ne pouvons pas rattacher le virement à votre compte.
        </Alert>
        <div>
          <InfoRow label="Délai de réception" value={delay} />
          {currency === "EUR" && <InfoRow label="Conversion indicative" value={`1 € ≈ ${eurRate.toLocaleString("fr-FR", { maximumFractionDigits: 4 })} $`} />}
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <Button
            size="lg"
            block
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await announceDeposit(currency);
                if (res?.error) toast.error(res.error);
              })
            }
          >
            {pending ? "Un instant…" : "J'ai fait le virement"}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            block
            onClick={async () => {
              if (navigator.share) {
                await navigator.share({ title: "Coordonnées FlashInv", text: shareText }).catch(() => {});
              } else {
                await navigator.clipboard.writeText(shareText);
                toast.success("Coordonnées copiées");
              }
            }}
          >
            <IconShare size={20} stroke={1.75} /> Partager les coordonnées
          </Button>
        </div>
      </div>
    </>
  );
}
