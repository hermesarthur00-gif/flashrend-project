import type { Metadata } from "next";
import { EmptyState, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/server/session";
import { getSettings } from "@/lib/server/settings";
import { getHoldings } from "@/lib/server/portfolio";
import { db } from "@/lib/server/db";
import { WithdrawFlow } from "./withdraw-flow";

export const metadata: Metadata = { title: "Retirer" };

export default async function WithdrawPage() {
  const user = await requireOnboardedUser();
  const [settings, { total }, accounts] = await Promise.all([getSettings(), getHoldings(user.id), db.bankAccount.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })]);

  let empty: React.ReactNode = null;
  if (user.kycStatus !== "APPROVED")
    empty = <EmptyState glyph="eth" title="Identité en cours de vérification" text="Les retraits s'ouvrent dès que votre identité est validée." action={<ButtonLink href="/account" variant="secondary">Retour à l&apos;accueil</ButtonLink>} />;
  else if (total <= 0.01)
    empty = <EmptyState title="Rien à retirer pour l'instant" text="Votre portefeuille est vide. Faites un dépôt pour commencer à placer." action={<ButtonLink href="/account/depot">Faire un dépôt</ButtonLink>} />;
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
        available={total}
        fee={settings.money.withdrawalFeeUsd}
        min={settings.money.withdrawalMinUsd}
        delay={settings.money.withdrawalDelay || "quelques jours ouvrés"}
        email={user.email}
        accounts={accounts.map((a) => ({ id: a.id, holder: a.holder, iban: a.iban, bankName: a.bankName }))}
      />
    </Page>
  );
}
