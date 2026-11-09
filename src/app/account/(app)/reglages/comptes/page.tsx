import type { Metadata } from "next";
import { IconBuildingBank } from "@tabler/icons-react";
import { Alert, IconTile, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { requireUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { AddBankForm, DeleteBankButton } from "./bank-client";

export const metadata: Metadata = { title: "Comptes bancaires" };

export default async function BankAccountsPage({ searchParams }: PageProps<"/account/reglages/comptes">) {
  const user = await requireUser();
  const sp = await searchParams;
  const back = sp.retour === "retrait" ? "/account/retrait" : "/account/reglages";
  const accounts = await db.bankAccount.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <>
      <TopBar title="Comptes bancaires" back={back} />
      <Page narrow>
        <PageHeading title="Comptes bancaires" back={back} />
        <p className="m-0 text-ink-muted">Vos retraits sont envoyés par virement sur l&apos;un de ces comptes. Il doit être à votre nom.</p>
        {accounts.length > 0 && (
          <ul className="m-0 list-none overflow-hidden rounded-lg border border-line bg-surface-raised p-0">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-t border-line px-4 py-3.5 first:border-t-0">
                <IconTile>
                  <IconBuildingBank size={22} stroke={1.75} />
                </IconTile>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-bold tabular-nums">{a.iban.replace(/(.{4})/g, "$1 ").trim()}</span>
                  <span className="truncate text-[13px] text-ink-muted">
                    {a.holder}
                    {a.bankName ? ` · ${a.bankName}` : ""}
                    {a.bic ? ` · ${a.bic}` : ""}
                  </span>
                </span>
                <DeleteBankButton id={a.id} />
              </li>
            ))}
          </ul>
        )}
        <section className="flex flex-col gap-3">
          <h2 className="text-h3 m-0">Ajouter un compte</h2>
          <AddBankForm defaultHolder={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()} />
        </section>
        <Alert tone="info" title="Pourquoi à votre nom ?">
          Pour protéger votre argent, FlashInv n&apos;envoie de virement que vers un compte dont vous êtes titulaire.
        </Alert>
      </Page>
    </>
  );
}
