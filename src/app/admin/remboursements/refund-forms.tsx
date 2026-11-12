"use client";
import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { ActionForm } from "@/components/admin/action-form";
import { Field, SubmitButton } from "@/components/app/form";
import { Button } from "@/components/ui/button";
import { acceptRefund, markRefundSent, rejectRefund } from "../actions";

export function AcceptRefundForm({ id }: { id: string }) {
  return (
    <ActionForm action={acceptRefund}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton pendingLabel="Enregistrement…">
        <IconCheck size={20} stroke={2} /> Accepter la demande
      </SubmitButton>
    </ActionForm>
  );
}

export function SendRefundForm({ id }: { id: string }) {
  return (
    <ActionForm action={markRefundSent} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <Field label="Référence du virement envoyé" name="bankReference" placeholder="Référence de votre banque" />
      <SubmitButton pendingLabel="Enregistrement…">
        <IconCheck size={20} stroke={2} /> Marquer comme remboursé
      </SubmitButton>
    </ActionForm>
  );
}

export function RejectRefundForm({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <Button variant="ghost" size="lg" block onClick={() => setOpen(true)}>
        Refuser la demande
      </Button>
    );
  return (
    <ActionForm action={rejectRefund} className="flex flex-col gap-3 border-t border-line pt-3.5">
      <input type="hidden" name="id" value={id} />
      <Field label="Motif (visible par le client)" name="reason" placeholder="ex. : le dépôt a déjà été utilisé" required />
      <p className="m-0 text-sm text-ink-muted">Le montant est replacé sur le solde disponible du client.</p>
      <div className="flex gap-2">
        <Button type="submit" variant="secondary" className="text-down">
          Refuser
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </ActionForm>
  );
}
