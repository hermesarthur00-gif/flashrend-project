"use client";
import { useState } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { ActionForm } from "@/components/admin/action-form";
import { Field } from "@/components/app/form";
import { Button } from "@/components/ui/button";
import { reviewKyc } from "../actions";

const CHECKS = ["Le document est en cours de validité", "Nom et date de naissance identiques", "Le selfie correspond à la photo", "Le document n'est pas retouché"];

export function KycDecision({ id }: { id: string }) {
  const [checked, setChecked] = useState<boolean[]>(CHECKS.map(() => false));
  const all = checked.every(Boolean);
  return (
    <ActionForm action={reviewKyc} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <div>
        <h3 className="text-label m-0 mb-1">Contrôles</h3>
        {CHECKS.map((c, i) => (
          <label key={c} className="flex items-center gap-2.5 border-t border-line py-2.5 text-sm first:border-t-0">
            <input type="checkbox" checked={checked[i]} onChange={(e) => setChecked((s) => s.map((v, j) => (j === i ? e.target.checked : v)))} className="size-[18px] accent-ink" />
            {c}
          </label>
        ))}
      </div>
      <Field label="Motif en cas de refus" name="reason" placeholder="Visible par le client, ex. : photo floue, document expiré" />
      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-3">
        <Button type="submit" name="decision" value="reject" variant="secondary" className="text-down">
          <IconX size={18} stroke={2} /> Refuser
        </Button>
        <Button type="submit" name="decision" value="approve" disabled={!all} title={all ? undefined : "Cochez tous les contrôles"}>
          <IconCheck size={18} stroke={2} /> Valider l&apos;identité
        </Button>
      </div>
    </ActionForm>
  );
}
