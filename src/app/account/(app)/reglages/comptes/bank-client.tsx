"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconBuildingBank, IconChevronDown } from "@tabler/icons-react";
import { toast } from "sonner";
import { IconTile } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { BankAccountForm, RibDetails, groupIban, type BankValues } from "@/components/account/bank-account-form";
import { cn } from "@/lib/utils";
import { deleteBankAccount } from "../actions";

export type Account = BankValues & { id: string };

/** Ligne de compte : un clic affiche le RIB, avec Modifier et Supprimer. */
export function AccountRow({ account, open, onToggle, onChanged, allowDelete = true }: { account: Account; open: boolean; onToggle: () => void; onChanged?: (newId: string) => void; allowDelete?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <li className="border-t border-line first:border-t-0">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-ink">
        <IconTile>
          <IconBuildingBank size={22} stroke={1.75} />
        </IconTile>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold tabular-nums">
            {account.iban.slice(0, 4)} •••• {account.iban.slice(-4)}
          </span>
          <span className="truncate text-[13px] text-ink-muted">
            {account.holder}
            {account.bankName ? ` · ${account.bankName}` : ""}
          </span>
        </span>
        <span className="text-sm font-semibold text-ink-muted">{open ? "Masquer" : "Voir le RIB"}</span>
        <IconChevronDown size={18} stroke={1.75} className={cn("text-ink-muted transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {editing ? (
            <BankAccountForm
              id={account.id}
              initial={{ holder: account.holder, iban: groupIban(account.iban), bic: account.bic, bankName: account.bankName }}
              submitLabel="Enregistrer la correction"
              onCancel={() => setEditing(false)}
              onDone={(newId) => {
                setEditing(false);
                onChanged?.(newId);
                router.refresh();
              }}
            />
          ) : (
            <>
              <div className="rounded-md bg-surface-sunken px-3.5 py-1">
                <RibDetails v={account} />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  Modifier
                </Button>
                {allowDelete && (
                  <Button
                    variant="ghost"
                    className="text-down"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        if (!confirm("Supprimer ce compte bancaire ?")) return;
                        const res = await deleteBankAccount(account.id);
                        if (res.error) toast.error(res.error);
                        else {
                          toast.success(res.ok);
                          router.refresh();
                        }
                      })
                    }
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </li>
  );
}

export function AccountsList({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!accounts.length) return null;
  return (
    <ul className="m-0 list-none overflow-hidden rounded-lg border border-line bg-surface-raised p-0">
      {accounts.map((a) => (
        <AccountRow key={a.id} account={a} open={open === a.id} onToggle={() => setOpen(open === a.id ? null : a.id)} onChanged={(id) => setOpen(id)} />
      ))}
    </ul>
  );
}

export function AddBankForm({ defaultHolder }: { defaultHolder: string }) {
  const router = useRouter();
  return <BankAccountForm initial={{ holder: defaultHolder, iban: "", bic: "", bankName: "" }} onDone={() => router.refresh()} />;
}
