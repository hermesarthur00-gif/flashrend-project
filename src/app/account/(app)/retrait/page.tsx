import type { Metadata } from "next";
import { EmptyState, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/server/session";
import { getSettings } from "@/lib/server/settings";
import { db } from "@/lib/server/db";
import { WithdrawFlow } from "./withdraw-flow";

export const metadata: Metadata = { title: "Retirer" };

export default async function WithdrawPage() {
  const user = await requireOnboardedUser();
  const [settings, accounts, invested] = await Promise.all([getSettings(), db.bankAccount.findMany({ where: { userId: user.id, archivedAt: null }, orderBy: { createdAt: "desc" } }), db.position.count({ where: { userId: user.id, quantity: { gt: 0 } } })]);
  const cash = Number(user.cashEur);

  let empty: React.ReactNode = null;
  if (user.kycStatus !== "APPROVED")
    empty = <EmptyState glyph="eth" title="Identité en cours de vérification" text="Les retraits s'ouvrent dès que votre identité est validée." action={<ButtonLink href="/account" variant="secondary">Retour à l&apos;accueil</ButtonLink>} />;
  else if (cash - settings.money.withdrawalFee <= 0.01)
    empty = invested ? (
      <EmptyState title="Aucun solde disponible" text="Seul le solde disponible peut être retiré. Désinvestissez d'abord le montant voulu, il sera ajouté à votre solde." action={<ButtonLink href="/account/desinvestir">Désinvestir</ButtonLink>} />
    ) : (
      <EmptyState title="Rien à retirer pour l'instant" text="Votre solde disponible est vide." action={<ButtonLink href="/account/depot">Faire un dépôt</ButtonLink>} />
    );
  else if (!accounts.length)
    empty = (
      <EmptyState
        glyph="doge"
        title="Ajoutez votre compte bancaire"
        text="Les retraits sont envoyés par virement sur un compte à votre nom."
        action={<ButtonLink href="/account/reglages/comptes?retour=retrait">Ajouter un compte</ButtonLink>}
      />
    );

  if (empty)
    return (
      <>
        <TopBar title="Retirer" back="/account" />
        <Page narrow>
          <PageHeading title="Retirer" />
          {empty}
        </Page>
      </>
    );

  return (
    <Page narrow className="px-0 pt-0 lg:px-10 lg:pt-8">
      <WithdrawFlow
        available={cash}
        fee={settings.money.withdrawalFee}
        min={settings.money.withdrawalMin}
        delay={settings.money.withdrawalDelay || "quelques jours ouvrés"}
        email={user.email}
        accounts={accounts.map((a) => ({ id: a.id, holder: a.holder, iban: a.iban, bic: a.bic ?? "", bankName: a.bankName ?? "" }))}
      />
    </Page>
  );
}
