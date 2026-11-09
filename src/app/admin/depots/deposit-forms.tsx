"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";
import { ActionForm } from "@/components/admin/action-form";
import { Field } from "@/components/app/form";
import { Alert } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/app/form";
import { formatEUR } from "@/lib/utils";
import { reconcileDeposit, recordUnannouncedDeposit, rejectDeposit } from "../actions";

const n = (v: string) => Number(v.replace(/\s/g, "").replace(",", ".")) || 0;
const today = () => new Date().toISOString().slice(0, 10);

export function ReconcileForm({ id, declared }: { id: string; declared: number | null }) {
  const [amount, setAmount] = useState(declared ? String(declared).replace(".", ",") : "");
  const router = useRouter();
  const credited = n(amount);
  return (
    <ActionForm action={reconcileDeposit} className="flex flex-col gap-3.5" onDone={() => router.replace("/admin/depots")}>
      <input type="hidden" name="id" value={id} />
      <Field label="Montant reçu" name="amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} suffix="€" required hint={declared && Math.abs(n(amount) - declared) >= 0.01 ? "Différent du montant déclaré : le client verra le montant réellement crédité." : "Corrigez si le montant reçu diffère (frais bancaires)."} />
      <Field label="Date de réception" name="receivedAt" type="date" defaultValue={today()} />
      <Alert tone="flash" title={`${formatEUR(credited)} seront crédités`}>
        Sur le solde disponible du client, qui reçoit une notification et un e-mail. Il choisit ensuite quand investir.
      </Alert>
      <SubmitButton disabled={credited <= 0} pendingLabel="Crédit…">
        <IconCheck size={20} stroke={2} /> Confirmer et créditer
      </SubmitButton>
    </ActionForm>
  );
}

export function RejectDepositForm({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <Button variant="ghost" size="lg" block onClick={() => setOpen(true)}>
        Refuser le dépôt
      </Button>
    );
  return (
    <ActionForm action={rejectDeposit} className="flex flex-col gap-3 border-t border-line pt-3.5">
      <input type="hidden" name="id" value={id} />
      <Field label="Raison (visible par le client)" name="note" placeholder="ex. : virement non reçu, compte émetteur à un autre nom" required />
      <div className="flex gap-2">
        <Button type="submit" variant="secondary" className="text-down">
          Refuser le dépôt
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </ActionForm>
  );
}

export function UnannouncedForm() {
  return (
    <ActionForm action={recordUnannouncedDeposit} className="flex flex-col gap-3.5" resetOnOk>
      <Field label="Référence du client" name="reference" placeholder="FI-48210" required autoComplete="off" />
      <Field label="Montant reçu" name="amount" inputMode="decimal" suffix="€" required />
      <SubmitButton pendingLabel="Crédit…">Enregistrer et créditer</SubmitButton>
    </ActionForm>
  );
}
