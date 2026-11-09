import type { Metadata } from "next";
import { EmptyState, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/server/session";
import { getSettings } from "@/lib/server/settings";
import { getAllocation } from "@/lib/server/portfolio";
import { db } from "@/lib/server/db";
import { InvestForm } from "./invest-form";

export const metadata: Metadata = { title: "Investir" };

export default async function InvestPage() {
  const user = await requireOnboardedUser();
  const cash = Number(user.cashEur);
  const [settings, allocation, assets] = await Promise.all([getSettings(), getAllocation(user.profile!), db.asset.findMany({ select: { symbol: true, name: true } })]);

  let empty: React.ReactNode = null;
  if (user.kycStatus !== "APPROVED") empty = <EmptyState glyph="eth" title="Identité en cours de vérification" text="Vous pourrez investir dès que votre identité sera validée et votre premier dépôt crédité." action={<ButtonLink href="/account" variant="secondary">Retour à l&apos;accueil</ButtonLink>} />;
  else if (cash < 0.01) empty = <EmptyState title="Aucun solde disponible" text="Faites d'abord un dépôt. Une fois vérifié, il est crédité ici et vous pourrez l'investir." action={<ButtonLink href="/account/depot">Faire un dépôt</ButtonLink>} />;

  if (empty)
    return (
      <>
        <TopBar title="Investir" back="/account" />
        <Page narrow>
          <PageHeading title="Investir" />
          {empty}
        </Page>
      </>
    );

  const names = Object.fromEntries(assets.map((a) => [a.symbol, a.name]));
  return (
    <>
      <TopBar title="Investir" back="/account" />
      <Page narrow>
        <PageHeading title="Investir" back="/account" />
        <InvestForm cash={cash} min={settings.money.investMin} profile={user.profile!} allocation={allocation.map((a) => ({ ...a, name: names[a.symbol] ?? a.symbol }))} />
      </Page>
    </>
  );
}
