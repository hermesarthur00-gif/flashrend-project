"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/admin/action-form";
import { Panel } from "@/components/admin/ui";
import { Field, SelectField, SubmitButton } from "@/components/app/form";
import { Button } from "@/components/ui/button";
import { banUser, deleteUser, setRole, unbanUser } from "../../actions";

/** Gestion du compte : rôle, bannissement, suppression. */
export function AccountManagement({ userId, email, role, banned, deletable }: { userId: string; email: string; role: "ADMIN" | "CLIENT"; banned: boolean; deletable: string | null }) {
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  return (
    <Panel title="Gestion du compte">
      <ActionForm action={setRole} className="flex items-end gap-2">
        <input type="hidden" name="userId" value={userId} />
        <div className="flex-1">
          <SelectField label="Rôle" name="role" defaultValue={role}>
            <option value="CLIENT">Client</option>
            <option value="ADMIN">Administrateur</option>
          </SelectField>
        </div>
        <SubmitButton size="md" block={false} variant="secondary" className="h-12">
          Appliquer
        </SubmitButton>
      </ActionForm>

      <div className="border-t border-line pt-3.5">
        {banned ? (
          <ActionForm action={unbanUser} className="flex flex-col gap-2">
            <input type="hidden" name="userId" value={userId} />
            <p className="m-0 text-sm text-ink-muted">Le compte retrouvera l&apos;accès à l&apos;app à sa prochaine connexion.</p>
            <SubmitButton size="md">Réactiver le compte</SubmitButton>
          </ActionForm>
        ) : (
          <ActionForm action={banUser} className="flex flex-col gap-2">
            <input type="hidden" name="userId" value={userId} />
            <Field label="Motif du bannissement (interne)" name="reason" placeholder="ex. : fraude suspectée" required />
            <SubmitButton size="md" variant="secondary" className="text-down">
              Bannir le compte
            </SubmitButton>
          </ActionForm>
        )}
      </div>

      <div className="border-t border-line pt-3.5">
        {deletable ? (
          <p className="m-0 text-sm text-ink-muted">Suppression impossible : {deletable}</p>
        ) : confirming ? (
          <ActionForm action={deleteUser} className="flex flex-col gap-2" onDone={() => router.replace("/admin/clients")}>
            <input type="hidden" name="userId" value={userId} />
            <p className="m-0 text-sm text-ink-muted">
              Sans opération, le compte est supprimé. Sinon, il est anonymisé : identité, pièces et coordonnées bancaires effacées, historique des dépôts et retraits conservé. Action définitive.
            </p>
            <Field label={`Tapez ${email} pour confirmer`} name="confirm" autoComplete="off" spellCheck={false} required />
            <div className="flex gap-2">
              <SubmitButton size="md" block={false} variant="secondary" className="text-down" pendingLabel="Suppression…">
                Supprimer définitivement
              </SubmitButton>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Annuler
              </Button>
            </div>
          </ActionForm>
        ) : (
          <Button variant="ghost" block className="text-down" onClick={() => setConfirming(true)}>
            Supprimer le compte
          </Button>
        )}
      </div>
    </Panel>
  );
}
