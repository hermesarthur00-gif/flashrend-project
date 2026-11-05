import type { Metadata } from "next";
import { Alert, EmptyState, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/server/session";
import { getSettings } from "@/lib/server/settings";
import { DepositFlow } from "./deposit-flow";
import { formatUSD } from "@/lib/utils";

export const metadata: Metadata = { title: "Déposer" };

export default async function DepositPage() {
  const user = await requireOnboardedUser();
  const settings = await getSettings();

  if (user.kycStatus !== "APPROVED") {
    return (
      <>
        <TopBar title="Déposer" back="/account" />
        <Page narrow>
          <PageHeading title="Déposer" />
          <EmptyState
            glyph="eth"
            title="Identité en cours de vérification"
            text="Les dépôts s'ouvrent dès que votre identité est validée. Vous recevrez une notification."
            action={<ButtonLink href="/account" variant="secondary">Retour à l&apos;accueil</ButtonLink>}
          />
        </Page>
      </>
    );
  }

  const banks = (["USD", "EUR"] as const).filter((c) => settings.bank[c].iban);
  return (
    <>
      <Page narrow className="px-0 pt-0 lg:px-10 lg:pt-8">
        {banks.length === 0 ? (
          <div className="px-4 pt-6">
            <Alert tone="warning" title="Dépôts momentanément indisponibles">
              Les coordonnées bancaires de FlashInv ne sont pas encore renseignées. Réessayez un peu plus tard.
            </Alert>
          </div>
        ) : (
          <DepositFlow
            reference={user.reference!}
            banks={Object.fromEntries(banks.map((c) => [c, settings.bank[c]]))}
            minLabel={settings.money.depositMinUsd > 0 ? `${formatUSD(settings.money.depositMinUsd)} ou équivalent en euros` : null}
            delay={settings.money.depositDelay}
            eurRate={settings.money.eurUsdRate}
          />
        )}
      </Page>
    </>
  );
}
