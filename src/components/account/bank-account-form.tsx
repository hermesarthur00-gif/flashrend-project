"use client";
import { useState, useTransition } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { toast } from "sonner";
import { Field } from "@/components/app/form";
import { Button } from "@/components/ui/button";
import { addBankAccount, updateBankAccount } from "@/app/account/(app)/reglages/actions";

export type BankValues = { holder: string; iban: string; bic: string; bankName: string };

export const groupIban = (iban: string) => iban.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();

/** Le RIB complet, en lecture. */
export function RibDetails({ v }: { v: BankValues }) {
  const rows: [string, string][] = [
    ["Titulaire", v.holder],
    ["IBAN", groupIban(v.iban)],
    ["BIC / SWIFT", v.bic || "Non renseigné"],
    ["Banque", v.bankName || "Non renseignée"],
  ];
  return (
    <dl className="m-0">
      {rows.map(([k, val]) => (
        <div key={k} className="flex justify-between gap-3 border-t border-line py-2.5 text-sm first:border-t-0">
          <dt className="text-ink-muted">{k}</dt>
          <dd className="m-0 text-right font-semibold [overflow-wrap:anywhere] tabular-nums">{val}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Ajout ou correction d'un compte de retrait, en deux temps :
 * saisie, puis récapitulatif avec avertissement à confirmer avant l'enregistrement.
 */
export function BankAccountForm({ id, initial, onDone, onCancel, submitLabel }: { id?: string; initial: BankValues; onDone?: (newId: string) => void; onCancel?: () => void; submitLabel?: string }) {
  const [v, setV] = useState<BankValues>(initial);
  const [step, setStep] = useState<"edit" | "review">("edit");
  const [checked, setChecked] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof BankValues) => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: e.target.value }));

  if (step === "review")
    return (
      <div className="flex flex-col gap-3.5">
        <div className="rounded-lg border border-line bg-surface-raised px-4 py-1">
          <RibDetails v={v} />
        </div>
        <div role="alert" className="flex gap-3 rounded-lg bg-warning-soft p-4">
          <IconAlertTriangle size={22} stroke={1.75} className="mt-px shrink-0 text-warning" aria-hidden="true" />
          <div className="text-sm leading-5">
            <p className="m-0 font-bold">Vérifiez ces coordonnées</p>
            <p className="m-0 mt-0.5 text-ink-muted">Vos retraits seront envoyés sur ce compte. Une erreur peut retarder ou empêcher la réception des fonds. Le compte doit être à votre nom.</p>
          </div>
        </div>
        <label className="flex items-start gap-2.5 text-sm font-semibold">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-ink" />
          J&apos;ai vérifié mes coordonnées bancaires
        </label>
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            block
            disabled={!checked || pending}
            onClick={() =>
              start(async () => {
                const fd = new FormData();
                fd.set("holder", v.holder);
                fd.set("iban", v.iban);
                fd.set("bic", v.bic);
                fd.set("bankName", v.bankName);
                fd.set("confirmed", "on");
                const res = id ? await updateBankAccount(id, fd) : await addBankAccount(fd);
                if (res.error) {
                  toast.error(res.error);
                  return;
                }
                toast.success(res.ok);
                setStep("edit");
                setChecked(false);
                if (!id) setV(initial);
                onDone?.(res.id!);
              })
            }
          >
            {pending ? "Enregistrement…" : (submitLabel ?? "Enregistrer ces coordonnées")}
          </Button>
          <Button variant="ghost" size="lg" block onClick={() => setStep("edit")}>
            Corriger
          </Button>
        </div>
      </div>
    );

  return (
    <form
      className="flex flex-col gap-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (v.holder.trim().length < 2) return toast.error("Indiquez le titulaire.");
        if (v.iban.replace(/\s/g, "").length < 6) return toast.error("Indiquez l'IBAN.");
        setStep("review");
      }}
    >
      <Field label="Titulaire du compte" value={v.holder} onChange={set("holder")} required autoComplete="name" />
      <Field label="IBAN" value={v.iban} onChange={set("iban")} required placeholder="FR76 3000 6000 0112 3456 7890 189" autoComplete="off" spellCheck={false} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="BIC / SWIFT" value={v.bic} onChange={set("bic")} placeholder="AGRIFRPP" autoComplete="off" spellCheck={false} />
        <Field label="Banque" value={v.bankName} onChange={set("bankName")} placeholder="Nom de la banque" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="lg" block>
          Vérifier mes coordonnées
        </Button>
        {onCancel && (
          <Button variant="ghost" size="lg" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}
