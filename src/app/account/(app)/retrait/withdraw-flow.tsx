"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { IconBuildingBank, IconChevronLeft, IconCircleCheck } from "@tabler/icons-react";
import { Alert, Card, Glyph, IconTile, InfoRow, StatusBadge } from "@/components/app/primitives";
import { OtpInput, ResendCode } from "@/components/app/form";
import { Stripes } from "@/components/ui/decor";
import { Button, ButtonLink } from "@/components/ui/button";
import { maskEmail } from "@/components/account/auth-ui";
import { cn, formatUSD } from "@/lib/utils";
import { confirmWithdrawal, requestWithdrawal } from "./actions";

type Account = { id: string; holder: string; iban: string; bankName: string | null };
const mask = (iban: string) => `${iban.slice(0, 4)} •••• ${iban.slice(-4)}`;

function Head({ title, onBack }: { title: string; onBack?: () => void }) {
  const cls = "grid size-11 place-items-center rounded-md hover:bg-ink/8";
  return (
    <header className="flex h-14 items-center gap-2 px-2 lg:px-0">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Retour" className={cls}>
          <IconChevronLeft size={22} stroke={1.75} />
        </button>
      ) : (
        <Link href="/account" aria-label="Retour" className={cls}>
          <IconChevronLeft size={22} stroke={1.75} />
        </Link>
      )}
      <h1 className="m-0 flex-1 text-center text-[17px] leading-6 font-bold lg:text-left lg:text-h2">{title}</h1>
      <span className="w-11" />
    </header>
  );
}

export function WithdrawFlow({ available, fee, min, delay, email, accounts }: { available: number; fee: number; min: number; delay: string; email: string; accounts: Account[] }) {
  const max = Math.max(0, Math.floor((available - fee) * 100) / 100);
  const [step, setStep] = useState<"amount" | "code" | "done">("amount");
  const [raw, setRaw] = useState("");
  const [accountId, setAccountId] = useState(accounts[0].id);
  const [codeId, setCodeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string; amount: number } | null>(null);
  const [pending, start] = useTransition();
  const amount = Number(raw.replace(/\s/g, "").replace(",", ".")) || 0;
  const account = accounts.find((a) => a.id === accountId)!;

  function send() {
    setError(null);
    start(async () => {
      const res = await requestWithdrawal({ amount, bankAccountId: accountId });
      if ("error" in res && res.error) return setError(res.error);
      if ("codeId" in res && res.codeId) {
        setCodeId(res.codeId);
        setStep("code");
      }
    });
  }

  function confirm(code: string) {
    if (code.length !== 6) return;
    setError(null);
    start(async () => {
      const res = await confirmWithdrawal({ codeId, code });
      if ("error" in res && res.error) return setError(res.error);
      if ("reference" in res && res.reference) {
        setResult({ reference: res.reference, amount: res.amount });
        setStep("done");
      }
    });
  }

  if (step === "done" && result) {
    return (
      <div className="flex flex-col gap-6 px-4 pt-6 pb-6 lg:px-0">
        <div className="relative -mx-4 grid h-[250px] place-items-center">
          <Glyph name="eth" size={64} rotate={-14} className="top-6 left-10" />
          <Glyph name="btc" size={56} rotate={12} className="right-12 bottom-8" />
          <div className="absolute top-8 right-[70px]">
            <Stripes count={4} height={48} />
          </div>
          <span className="grid size-28 place-items-center rounded-full bg-flash text-on-flash">
            <IconCircleCheck size={64} stroke={1.5} />
          </span>
        </div>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-h1 m-0">Retrait demandé</h1>
          <p className="m-0 text-ink-muted">
            <strong className="text-ink">{formatUSD(result.amount)}</strong> arrivent sur votre compte {mask(account.iban)} sous {delay}.
          </p>
        </div>
        <Card className="pt-1">
          <InfoRow label="Référence" value={result.reference} />
          <InfoRow label="Statut" value={<StatusBadge status="processing" />} />
        </Card>
        <div className="flex flex-col gap-2">
          <ButtonLink href="/account" size="lg" block>
            Retour à l&apos;accueil
          </ButtonLink>
          <ButtonLink href="/account/activite" variant="ghost" size="lg" block>
            Voir l&apos;activité
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (step === "code") {
    return (
      <>
        <Head title="Confirmer le retrait" onBack={() => setStep("amount")} />
        <form
          className="flex flex-col gap-6 px-4 pt-2 pb-6 lg:px-0"
          onSubmit={(e) => {
            e.preventDefault();
            confirm(String(new FormData(e.currentTarget).get("code") ?? ""));
          }}
        >
          <Card>
            <span className="text-caption text-ink-muted">Vous retirez</span>
            <p className="text-amount-xl m-0 mt-1 mb-2">{formatUSD(amount)}</p>
            <InfoRow label="Vers" value={mask(account.iban)} />
            <InfoRow label="Frais" value={formatUSD(fee)} />
            <InfoRow label="Arrivée estimée" value={delay} />
          </Card>
          <div className="flex flex-col gap-3">
            <span className="text-label">Code envoyé par e-mail à {maskEmail(email)}</span>
            {error && <Alert tone="down" title={error} />}
            <OtpInput disabled={pending} onComplete={confirm} />
            <ResendCode
              onResend={async () => {
                const res = await requestWithdrawal({ amount, bankAccountId: accountId });
                if ("codeId" in res && res.codeId) setCodeId(res.codeId);
                else if ("error" in res && res.error) setError(res.error);
              }}
            />
          </div>
          <Button type="submit" size="lg" block disabled={pending}>
            {pending ? "Confirmation…" : "Confirmer le retrait"}
          </Button>
        </form>
      </>
    );
  }

  const quick = [0.25, 0.5, 1].map((r) => ({ label: r === 1 ? "Tout" : `${r * 100} %`, value: Math.floor(max * r * 100) / 100 }));
  const tooLow = amount > 0 && amount < min;
  const tooHigh = amount > max;

  return (
    <>
      <Head title="Retirer" />
      <div className="flex flex-col gap-5 px-4 pt-2 pb-6 lg:px-0">
        <div className="flex items-center justify-between rounded-lg bg-surface-sunken px-4 py-3.5">
          <span className="text-sm text-ink-muted">Disponible au retrait</span>
          <span className="text-amount">{formatUSD(max)}</span>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="amount" className="text-label">
            Montant à retirer
          </label>
          <div className="flex items-baseline gap-2 border-b-2 border-ink pb-1">
            <input
              id="amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              value={raw}
              onChange={(e) => setRaw(e.target.value.replace(/[^\d.,\s]/g, ""))}
              className="text-amount-xl w-full min-w-0 bg-transparent outline-none placeholder:text-ink-muted/50"
              aria-invalid={tooLow || tooHigh || undefined}
            />
            <span className="text-h2 text-ink-muted">$</span>
          </div>
          <div className="flex gap-2">
            {quick.map((q) => (
              <button key={q.label} type="button" onClick={() => setRaw(String(q.value).replace(".", ","))} className="h-9 rounded-full border border-line-strong px-3.5 text-sm font-semibold hover:bg-surface-sunken">
                {q.label}
              </button>
            ))}
          </div>
          {(tooLow || tooHigh) && <p className="m-0 text-sm text-down">{tooHigh ? `Maximum ${formatUSD(max)}.` : `Minimum ${formatUSD(min)}.`}</p>}
        </div>
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="text-label mb-2">Vers le compte</legend>
          {accounts.map((a) => (
            <label key={a.id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg bg-surface-raised px-4 py-3.5", a.id === accountId ? "border-2 border-ink" : "border border-line")}>
              <input type="radio" name="account" value={a.id} checked={a.id === accountId} onChange={() => setAccountId(a.id)} className="sr-only" />
              <IconTile>
                <IconBuildingBank size={22} stroke={1.75} />
              </IconTile>
              <span className="flex flex-1 flex-col">
                <span className="font-bold tabular-nums">{mask(a.iban)}</span>
                <span className="text-[13px] text-ink-muted">
                  {a.holder}
                  {a.bankName ? ` · ${a.bankName}` : ""}
                </span>
              </span>
            </label>
          ))}
          <Link href="/account/reglages/comptes?retour=retrait" className="self-start text-sm font-semibold underline underline-offset-2">
            Ajouter un compte
          </Link>
        </fieldset>
        <div>
          <InfoRow label="Frais de retrait" value={formatUSD(fee)} />
          <InfoRow label="Vous recevrez" value={formatUSD(amount)} strong />
          <InfoRow label="Débité du portefeuille" value={formatUSD(amount + (amount ? fee : 0))} />
          <InfoRow label="Délai" value={delay} />
        </div>
        {error && <Alert tone="down" title={error} />}
        <Button size="lg" block disabled={pending || !amount || tooLow || tooHigh} onClick={send}>
          {pending ? "Envoi du code…" : "Continuer"}
        </Button>
      </div>
    </>
  );
}
