import type { Metadata } from "next";
import { Badge, Card, Page, PageHeading, SectionTitle, TopBar, EmptyState } from "@/components/app/primitives";
import { PortfolioLiveChart } from "@/components/live/live-chart";
import { LiveAllocation, LiveHoldingRows, LiveInvested } from "@/components/live/live-widgets";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/server/session";
import { getFlows, getPortfolioSummary, getSnapshots } from "@/lib/server/portfolio";
import { db } from "@/lib/server/db";
import { PROFILE_LABELS, formatDate, formatEUR } from "@/lib/utils";

export const metadata: Metadata = { title: "Portefeuille" };

export default async function PortfolioPage() {
  const user = await requireOnboardedUser();
  const [s, series, flows, lastRebalance] = await Promise.all([
    getPortfolioSummary(user.id),
    getSnapshots(user.id),
    getFlows(user.id),
    db.activity.findFirst({ where: { userId: user.id, type: { in: ["REBALANCE", "PROFILE"] } }, orderBy: { createdAt: "desc" } }),
  ]);
  const positions = s.items.map((h) => ({ symbol: h.symbol, name: h.name, quantity: h.quantity }));

  return (
    <>
      <TopBar title="Portefeuille" />
      <Page>
        <PageHeading
          title="Portefeuille"
          sub={`Profil ${PROFILE_LABELS[user.profile!].toLowerCase()}`}
          actions={
            positions.length > 0 ? (
              <>
                <ButtonLink href="/account/desinvestir" variant="secondary">
                  Désinvestir
                </ButtonLink>
                <ButtonLink href="/account/investir">Investir</ButtonLink>
              </>
            ) : undefined
          }
        />
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <Card className="p-3.5 lg:p-5">
            <span className="text-caption text-ink-muted">Solde disponible</span>
            <p className="text-amount m-0 mt-1 text-lg tabular-nums">{formatEUR(s.cash)}</p>
            <span className="text-sm text-ink-muted">Non investi</span>
          </Card>
          <Card className="p-3.5 lg:p-5">
            <span className="text-caption text-ink-muted">Investi</span>
            <LiveInvested positions={positions} investedNet={s.investedNet} />
          </Card>
        </div>
        {positions.length === 0 ? (
          <EmptyState
            title="Rien d'investi pour l'instant"
            text={s.cash >= 0.01 ? "Investissez votre solde disponible : il sera réparti sur les cryptos de votre profil." : "Faites un dépôt. Une fois crédité, vous pourrez l'investir."}
            action={s.cash >= 0.01 ? <ButtonLink href="/account/investir">Investir</ButtonLink> : <ButtonLink href="/account/depot">Faire un dépôt</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
            <Card className="lg:col-span-12">
              <PortfolioLiveChart positions={positions} daily={series} flows={flows} investedNet={s.investedNet} title="Valeur investie" />
            </Card>
            <div className="grid grid-cols-2 gap-2 lg:hidden">
              <ButtonLink href="/account/desinvestir" variant="secondary">
                Désinvestir
              </ButtonLink>
              <ButtonLink href="/account/investir">Investir</ButtonLink>
            </div>
            <Card className="lg:col-span-5">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-h3 m-0">Répartition</h2>
                <Badge tone="flash">{PROFILE_LABELS[user.profile!]}</Badge>
              </div>
              <LiveAllocation positions={positions} />
              {lastRebalance && <p className="text-caption m-0 mt-3 text-ink-muted">Ajustée le {formatDate(lastRebalance.createdAt)}.</p>}
            </Card>
            <section className="flex flex-col gap-1 lg:col-span-7 lg:rounded-lg lg:border lg:border-line lg:bg-surface-raised lg:p-6">
              <SectionTitle title="Détail par crypto" />
              <LiveHoldingRows positions={positions} />
            </section>
          </div>
        )}
      </Page>
    </>
  );
}
