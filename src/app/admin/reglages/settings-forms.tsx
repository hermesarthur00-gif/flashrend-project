"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ActionForm } from "@/components/admin/action-form";
import { Panel } from "@/components/admin/ui";
import { Field, OtpInput, SubmitButton } from "@/components/app/form";
import { Alert, Badge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { maskEmail } from "@/components/account/auth-ui";
import type { Settings } from "@/lib/settings-schema";
import { cn } from "@/lib/utils";
import { confirmBankChange, requestBankChange, saveSettings, setRole } from "../actions";

type F = { name: string; label: string; value: string; placeholder?: string; hint?: string; type?: string; wide?: boolean };

export function SectionForm({ section, fields }: { section: "legal" | "contact" | "money"; fields: F[] }) {
  return (
    <ActionForm action={saveSettings} className="flex flex-col gap-4">
      <input type="hidden" name="section" value={section} />
      <div className="grid gap-3.5 sm:grid-cols-2">
        {fields.map((f) => (
          <Field key={f.name} name={f.name} label={f.label} defaultValue={f.value} placeholder={f.placeholder ? `ex. ${f.placeholder}` : undefined} hint={f.hint} type={f.type} className={cn(f.wide && "sm:col-span-2")} />
        ))}
      </div>
      <SubmitButton size="md" block={false} className="self-start" pendingLabel="Enregistrement…">
        Enregistrer
      </SubmitButton>
    </ActionForm>
  );
}

type Bank = Settings["bank"]["USD"];

export function BankSettings({ bank, email }: { bank: Settings["bank"]; email: string }) {
  const [currency, setCurrency] = useState<"USD" | "EUR">("USD");
  const [closed, setClosed] = useState<string | null>(null);
  const [reqState, reqAction] = useActionState(requestBankChange, undefined);
  const router = useRouter();
  const b: Bank = bank[currency];
  const codeId = reqState?.codeId && reqState.codeId !== closed ? reqState.codeId : null;
  const setCodeId = (v: null) => setClosed(v ?? reqState?.codeId ?? null);

  useEffect(() => {
    if (reqState?.error) toast.error(reqState.error);
    if (reqState?.codeId) toast.success(reqState.ok);
  }, [reqState]);

  return (
    <Panel title="Coordonnées bancaires" right={<Badge tone="flash">Affichées aux clients</Badge>} className="max-w-[720px]">
      <div role="tablist" aria-label="Devise" className="flex w-fit rounded-md bg-surface-sunken p-0.5">
        {(["USD", "EUR"] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={c === currency}
            onClick={() => {
              setCurrency(c);
              setCodeId(null);
            }}
            className={cn("h-9 rounded-sm px-4 text-sm font-semibold", c === currency ? "bg-surface-raised text-ink" : "text-ink-muted")}
          >
            Compte {c}
          </button>
        ))}
      </div>
      {codeId ? (
        <ActionForm
          action={confirmBankChange}
          className="flex flex-col gap-4"
          onDone={() => {
            setCodeId(null);
            router.refresh();
          }}
        >
          <input type="hidden" name="codeId" value={codeId} />
          <p className="m-0 font-semibold">Code envoyé à {maskEmail(email)}</p>
          <OtpInput />
          <div className="flex gap-2">
            <SubmitButton size="md" block={false} pendingLabel="Vérification…">
              Confirmer la modification
            </SubmitButton>
            <Button variant="ghost" onClick={() => setCodeId(null)}>
              Annuler
            </Button>
          </div>
        </ActionForm>
      ) : (
        <form action={reqAction} key={currency} className="flex flex-col gap-3.5">
          <input type="hidden" name="currency" value={currency} />
          <Field label="Bénéficiaire" name="beneficiary" defaultValue={b.beneficiary} placeholder="ex. FlashInv SAS" />
          <Field label={currency === "EUR" ? "IBAN" : "IBAN ou numéro de compte"} name="iban" defaultValue={b.iban} placeholder="ex. FR76 3000 6000 0112 3456 7890 189" spellCheck={false} />
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="BIC / SWIFT" name="swift" defaultValue={b.swift} placeholder="ex. AGRIFRPP" spellCheck={false} />
            <Field label="Banque" name="bankName" defaultValue={b.bankName} placeholder="ex. Nom de la banque" />
          </div>
          <Field label="Adresse de la banque" name="bankAddress" defaultValue={b.bankAddress} placeholder="Utile pour les virements internationaux en dollars" />
          <Alert tone="warning" title="Changement sensible">
            Toute modification est confirmée par un code envoyé par e-mail et notée dans le journal.
          </Alert>
          <SubmitButton size="md" block={false} className="self-start" pendingLabel="Envoi du code…">
            Enregistrer
          </SubmitButton>
        </form>
      )}
    </Panel>
  );
}

export function TeamForm({ email, remove }: { email?: string; remove?: boolean }) {
  if (remove)
    return (
      <ActionForm action={setRole}>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="role" value="CLIENT" />
        <Button type="submit" variant="ghost" size="sm" className="text-down">
          Retirer
        </Button>
      </ActionForm>
    );
  return (
    <ActionForm action={setRole} className="flex flex-col gap-3" resetOnOk>
      <input type="hidden" name="role" value="ADMIN" />
      <Field label="E-mail" name="email" type="email" required />
      <SubmitButton size="md" pendingLabel="Ajout…">
        Ajouter
      </SubmitButton>
    </ActionForm>
  );
}
