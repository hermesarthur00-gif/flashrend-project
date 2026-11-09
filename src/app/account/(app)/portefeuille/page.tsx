import type { Metadata } from "next";
import { AllocationDonut } from "@/components/ui/finance";
import { Badge, Card, Page, PageHeading, SectionTitle, TopBar, EmptyState } from "@/components/app/primitives";
import { HoldingRow } from "@/components/account/widgets";
import { ValueChart } from "@/components/account/value-chart";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/server/session";
import { getPortfolioSummary, getSnapshots } from "@/lib/server/portfolio";
import { db } from "@/lib/server/db";
import type { CryptoSymbol } from "@/lib/landing-data";
import { PROFILE_LABELS, cn, daysAgo, formatDate, formatUSD } from "@/lib/utils";

export const metadata: Metadata = { title: "Portefeuille" };

export default async function PortfolioPage() {
  const user = await requireOnboardedUser();
  const [s, series, lastRebalance] = await Promise.all([
    getPortfolioSummary(user.id),
    getSnapshots(user.id),
    db.activity.findFirst({ where: { userId: user.id, type: { in: ["REBALANCE", "PROFILE"] } }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <>
      <TopBar title="Portefeuille" />
      <Page>
        <PageHeading title="Portefeuille" sub={`Profil ${PROFILE_LABELS[user.profile!].toLowerCase()}`} />
        {s.items.length === 0 ? (
          <EmptyState
            title="Votre portefeuille est vide"
            text="Dès votre premier virement reçu, FlashInv le répartit sur les cryptos de votre profil."
            action={<ButtonLink href="/account/depot">Faire un dépôt</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
            <Card className="lg:col-span-8">
              <span className="text-overline text-ink-muted">Valeur totale</span>
              <div className="mt-1">
                <ValueChart series={series.length ? series : [{ t: daysAgo(1).getTime(), v: s.netInvested }, { t: daysAgo(0).getTime(), v: s.total }]} label="Valeur du portefeuille" />
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1 lg:gap-4">
              <Card className="p-3.5 lg:p-5">
                <span className="text-caption text-ink-muted">Total déposé</span>
                <p className="text-amount m-0 mt-1 text-lg">{formatUSD(s.netInvested)}</p>
              </Card>
              <Card className="p-3.5 lg:p-5">
                <span className="text-caption text-ink-muted">Gains</span>
                <p className={cn("text-amount m-0 mt-1 text-lg", s.gain >= 0 ? "text-up" : "text-down")}>
                  {s.gain >= 0 ? "+" : "−"}
                  {formatUSD(Math.abs(s.gain))}
                </p>
              </Card>
            </div>
            <Card className="lg:col-span-5">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-h3 m-0">Répartition</h2>
                <Badge tone="flash">{PROFILE_LABELS[user.profile!]}</Badge>
              </div>
              <AllocationDonut items={s.items.map((h) => ({ symbol: h.symbol as CryptoSymbol, value: h.valueUsd }))} />
              {lastRebalance && <p className="text-caption m-0 mt-3 text-ink-muted">Ajustée par FlashInv le {formatDate(lastRebalance.createdAt)}.</p>}
            </Card>
            <section className="flex flex-col gap-1 lg:col-span-7 lg:rounded-lg lg:border lg:border-line lg:bg-surface-raised lg:p-6">
              <SectionTitle title="Détail par actif" />
              {s.items.map((h) => (
                <HoldingRow key={h.symbol} h={h} href={`/account/portefeuille/${h.symbol.toLowerCase()}`} />
              ))}
            </section>
          </div>
        )}
      </Page>
    </>
  );
}
