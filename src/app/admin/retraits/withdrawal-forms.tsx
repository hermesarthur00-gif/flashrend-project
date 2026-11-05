"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";
import { ActionForm } from "@/components/admin/action-form";
import { Field, SubmitButton } from "@/components/app/form";
import { Button } from "@/components/ui/button";
import { markWithdrawalSent, rejectWithdrawal } from "../actions";

export function SendWithdrawalForm({ id }: { id: string }) {
  const router = useRouter();
  return (
    <ActionForm action={markWithdrawalSent} className="flex flex-col gap-3" onDone={() => router.replace("/admin/retraits")}>
      <input type="hidden" name="id" value={id} />
      <Field label="Référence du virement envoyé" name="bankReference" placeholder="Référence de votre banque" />
      <SubmitButton pendingLabel="Enregistrement…">
        <IconCheck size={20} stroke={2} /> Marquer comme envoyé
      </SubmitButton>
    </ActionForm>
  );
}

export function RejectWithdrawalForm({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  if (!open)
    return (
      <Button variant="ghost" size="lg" block onClick={() => setOpen(true)}>
        Refuser la demande
      </Button>
    );
  return (
    <ActionForm action={rejectWithdrawal} className="flex flex-col gap-3 border-t border-line pt-3.5" onDone={() => router.replace("/admin/retraits")}>
      <input type="hidden" name="id" value={id} />
      <Field label="Motif (visible par le client)" name="reason" placeholder="ex. : compte bancaire au nom d'un tiers" required />
      <p className="m-0 text-sm text-ink-muted">Le montant et les frais sont replacés sur le portefeuille du client, selon son profil.</p>
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
