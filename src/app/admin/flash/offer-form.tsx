"use client";
import { ActionForm } from "@/components/admin/action-form";
import { Field, SubmitButton } from "@/components/app/form";
import { deleteFlashOffer, saveFlashOffer, toggleFlashOffer } from "../actions";

export type OfferRow = { id: string; name: string; rate: number; min: number; max: number | null; active: boolean; subs: number };
const fr = (n: number) => String(n).replace(".", ",");

export function OfferForm({ offer }: { offer?: OfferRow }) {
  return (
    <ActionForm action={saveFlashOffer} resetOnOk={!offer} className="flex flex-col gap-3">
      {offer && <input type="hidden" name="id" value={offer.id} />}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Field label="Nom de l'offre" name="name" defaultValue={offer?.name} placeholder="Flash Découverte" maxLength={40} required className="col-span-2 lg:col-span-1" />
        <Field label="Rendement en 24 h" name="rate" inputMode="decimal" defaultValue={offer ? fr(offer.rate) : undefined} placeholder="1,5" suffix="%" required />
        <Field label="Minimum" name="min" inputMode="decimal" defaultValue={offer ? fr(offer.min) : undefined} placeholder="50" suffix="€" required />
        <Field label="Maximum (facultatif)" name="max" inputMode="decimal" defaultValue={offer?.max != null ? fr(offer.max) : undefined} placeholder="Aucun" suffix="€" />
      </div>
      <div className="flex flex-wrap gap-2">
        <SubmitButton size="md" pendingLabel="Enregistrement…">
          {offer ? "Enregistrer" : "Créer l'offre"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

export function OfferActions({ offer }: { offer: OfferRow }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActionForm action={toggleFlashOffer}>
        <input type="hidden" name="id" value={offer.id} />
        <SubmitButton variant="secondary" size="sm" pendingLabel="…">
          {offer.active ? "Fermer l'offre" : "Rouvrir l'offre"}
        </SubmitButton>
      </ActionForm>
      {offer.subs === 0 && (
        <ActionForm action={deleteFlashOffer}>
          <input type="hidden" name="id" value={offer.id} />
          <SubmitButton variant="secondary" size="sm" pendingLabel="…">
            Supprimer
          </SubmitButton>
        </ActionForm>
      )}
    </div>
  );
}

