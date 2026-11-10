import Link from "next/link";
import { IconBolt, IconChartLine } from "@tabler/icons-react";
import { NotificationBell } from "@/components/account/notifications-live";
import { Logo } from "@/components/ui/logo";
import { Alert, Badge, Card, IconTile, Page, SectionTitle } from "@/components/app/primitives";
import { ActivityList, toActivity } from "@/components/account/widgets";
import { LiveAllocation, LiveBalanceCard, LiveHoldingRows, LiveInvestmentCard } from "@/components/live/live-widgets";
import { PortfolioLiveChart } from "@/components/live/live-chart";
import { LiveFlashCard } from "@/components/live/flash-chart";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/server/session";
import { getFlows, getPortfolioSummary, getSnapshots } from "@/lib/server/portfolio";
import { db } from "@/lib/server/db";
import { PROFILE_LABELS, PROFILE_RISK, formatMoney, formatEUR } from "@/lib/utils";

export default async function HomePage() {
  const user = await requireOnboardedUser();
  const [summary, activity, pendingDeposits, series, flows, flashRunning, flashOffers] = await Promise.all([
    getPortfolioSummary(user.id),
    db.activity.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.deposit.findMany({ where: { userId: user.id, status: "ANNOUNCED" }, orderBy: { announcedAt: "desc" } }),
    getSnapshots(user.id),
    getFlows(user.id),
    db.flashInvestment.findMany({ where: { userId: user.id, status: "RUNNING" }, orderBy: { endsAt: "asc" } }),
    db.flashOffer.findMany({ where: { active: true }, orderBy: { ratePercent: "desc" }, take: 1 }),
  ]);
  const profile = user.profile!;
  const positions = summary.items.map((h) => ({ symbol: h.symbol, name: h.name, quantity: h.quantity }));
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" }).format(new Date());
  const canInvest = user.kycStatus === "APPROVED" && summary.cash >= 0.01;

  return (
    <>
      <header className="flex h-[60px] items-center gap-2 pr-2 pl-4 lg:hidden">
        <Logo variant="symbol" size={32} />
        <div className="flex flex-1 flex-col">
          <span className="text-caption text-ink-muted">Bonjour</span>
          <span className="text-base leading-5 font-bold">
            {user.firstName} {user.lastName}
          </span>
        </div>
        <NotificationBell />
      </header>
      <Page>
        <div className="hidden items-end justify-between gap-4 lg:flex">
          <div>
            <p className="text-caption m-0 text-ink-muted first-letter:uppercase">{today}</p>
            <h1 className="text-h1 m-0">Bonjour {user.firstName}</h1>
          </div>
          <div className="flex gap-2">
            <ButtonLink href="/account/retrait" variant="secondary">
              Retirer
            </ButtonLink>
            <ButtonLink href="/account/depot" variant="secondary">
              Déposer
            </ButtonLink>
            <ButtonLink href="/account/investir">Investir</ButtonLink>
          </div>
        </div>

        {user.kycStatus === "PENDING" && (
          <Alert tone="warning" title="Vérification d'identité en cours">
            Vous pourrez déposer dès que votre identité sera validée. Nous vous prévenons par notification.
          </Alert>
        )}
        {pendingDeposits.map((d) => (
          <Alert
            key={d.id}
            tone="info"
            title={`Dépôt de ${d.declaredAmount ? formatMoney(Number(d.declaredAmount), d.currency) : d.currency} en vérification`}
            action={
              <Link href={`/account/depot/${d.id}`} className="text-sm font-semibold text-ink underline underline-offset-2">
                Suivre le dépôt
              </Link>
            }
          >
            Votre solde sera crédité dès que nous aurons confirmé la réception.
          </Alert>
        ))}
        {canInvest && (
          <Alert tone="flash" title={`${formatEUR(summary.cash)} disponibles à investir`} action={<ButtonLink href="/account/investir" size="sm">Investir</ButtonLink>}>
            Ils seront répartis selon votre profil {PROFILE_LABELS[profile].toLowerCase()}.
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-5 lg:col-span-5 lg:gap-6">
            <LiveBalanceCard cash={summary.cash} />
            <LiveInvestmentCard positions={positions} investedNet={summary.investedNet} cash={summary.cash} href="/account/portefeuille" />
            {flashRunning.map((f) => (
              <LiveFlashCard key={f.id} compact f={{ id: f.id, offerName: f.offerName, ratePercent: Number(f.ratePercent), amount: Number(f.amountEur), gain: Number(f.gainEur), startsAt: f.startsAt.getTime(), endsAt: f.endsAt.getTime(), seed: f.seed }} />
            ))}
            {flashRunning.length === 0 && flashOffers[0] && user.kycStatus === "APPROVED" && (
              <Link href="/account/flash" className="flex items-center gap-3 rounded-lg border border-line bg-surface-raised px-4 py-3.5 text-ink hover:border-line-strong">
                <IconTile tone="flash">
                  <IconBolt size={22} stroke={2} />
                </IconTile>
                <span className="flex flex-1 flex-col">
                  <span className="font-bold">Flash 24 h</span>
                  <span className="text-sm text-ink-muted">Jusqu&apos;à +{Number(flashOffers[0].ratePercent).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} % en 24 h</span>
                </span>
                <span className="text-sm font-semibold">Découvrir</span>
              </Link>
            )}
            <Link href="/account/profil" className="flex items-center gap-3 rounded-lg bg-flash-soft px-4 py-3.5 text-ink lg:hidden">
              <IconTile tone="flash">
                <IconChartLine size={22} stroke={1.75} />
              </IconTile>
              <span className="flex flex-1 flex-col">
                <span className="text-caption text-flash-text">Votre profil</span>
                <span className="font-bold">
                  {PROFILE_LABELS[profile]} · risque {PROFILE_RISK[profile]}/5
                </span>
              </span>
              <span className="text-sm font-semibold">Modifier</span>
            </Link>
            {positions.length > 0 && (
              <Card className="hidden lg:block">
                <div className="mb-3.5 flex items-baseline justify-between">
                  <h2 className="text-h3 m-0">Répartition</h2>
                  <Badge tone="flash">
                    {PROFILE_LABELS[profile]} · {PROFILE_RISK[profile]}/5
                  </Badge>
                </div>
                <LiveAllocation positions={positions} />
              </Card>
            )}
          </div>
          <Card className="hidden lg:col-span-7 lg:block">
            <PortfolioLiveChart positions={positions} daily={series} flows={flows} investedNet={summary.investedNet} title="Valeur investie" />
          </Card>

          <section className="flex flex-col gap-1 lg:col-span-7 lg:rounded-lg lg:border lg:border-line lg:bg-surface-raised lg:p-6">
            <SectionTitle title="Vos investissements" link="Portefeuille" href="/account/portefeuille" />
            <LiveHoldingRows
              positions={positions}
              empty={
                <p className="m-0 py-4 text-ink-muted">
                  {summary.cash >= 0.01 ? "Rien d'investi pour l'instant. Investissez votre solde disponible pour commencer." : "Rien d'investi pour l'instant. Commencez par un dépôt : une fois crédité, vous pourrez l'investir."}
                </p>
              }
            />
          </section>
          <section className="flex flex-col gap-1 lg:col-span-5 lg:rounded-lg lg:border lg:border-line lg:bg-surface-raised lg:p-6">
            <SectionTitle title="Activité récente" link="Tout voir" href="/account/activite" />
            <ActivityList items={toActivity(activity)} />
          </section>
        </div>
      </Page>
    </>
  );
}
