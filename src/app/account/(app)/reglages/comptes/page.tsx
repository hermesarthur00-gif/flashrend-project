import type { Metadata } from "next";
import { Alert, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { requireUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { AccountsList, AddBankForm } from "./bank-client";

export const metadata: Metadata = { title: "Comptes bancaires" };

export default async function BankAccountsPage({ searchParams }: PageProps<"/account/reglages/comptes">) {
  const user = await requireUser();
  const sp = await searchParams;
  const back = sp.retour === "retrait" ? "/account/retrait" : "/account/reglages";
  const accounts = await db.bankAccount.findMany({ where: { userId: user.id, archivedAt: null }, orderBy: { createdAt: "desc" } });

  return (
    <>
      <TopBar title="Comptes bancaires" back={back} />
      <Page narrow>
        <PageHeading title="Comptes bancaires" back={back} />
        <p className="m-0 text-ink-muted">Vos retraits sont envoyés par virement sur l&apos;un de ces comptes. Il doit être à votre nom. Touchez un compte pour voir ou corriger son RIB.</p>
        <AccountsList accounts={accounts.map((a) => ({ id: a.id, holder: a.holder, iban: a.iban, bic: a.bic ?? "", bankName: a.bankName ?? "" }))} />
        <section className="flex flex-col gap-3">
          <h2 className="text-h3 m-0">Ajouter un compte</h2>
          <AddBankForm defaultHolder={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()} />
        </section>
        <Alert tone="info" title="Pourquoi à votre nom ?">
          Pour protéger votre argent, FlashRend n&apos;envoie de virement que vers un compte dont vous êtes titulaire.
        </Alert>
      </Page>
    </>
  );
}
