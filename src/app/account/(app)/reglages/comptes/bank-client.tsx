"use client";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { Field, SubmitButton, useActionToast } from "@/components/app/form";
import { addBankAccount, deleteBankAccount } from "../actions";

export function AddBankForm({ defaultHolder }: { defaultHolder: string }) {
  const [state, action] = useActionState(addBankAccount, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useActionToast(state);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-3.5">
      <Field label="Titulaire du compte" name="holder" defaultValue={defaultHolder} required autoComplete="name" />
      <Field label="IBAN ou numéro de compte" name="iban" required placeholder="FR76 3000 6000 0112 3456 7890 189" autoComplete="off" spellCheck={false} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="BIC / SWIFT" name="bic" placeholder="AGRIFRPP" autoComplete="off" spellCheck={false} />
        <Field label="Banque" name="bankName" placeholder="Nom de la banque" />
      </div>
      <SubmitButton pendingLabel="Ajout…">Ajouter ce compte</SubmitButton>
    </form>
  );
}

export function DeleteBankButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label="Supprimer ce compte"
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (!confirm("Supprimer ce compte bancaire ?")) return;
          const res = await deleteBankAccount(id);
          if (res.error) toast.error(res.error);
          else toast.success(res.ok);
        })
      }
      className="grid size-10 place-items-center rounded-md text-ink-muted hover:bg-down-soft hover:text-down"
    >
      <IconTrash size={20} stroke={1.75} />
    </button>
  );
}
