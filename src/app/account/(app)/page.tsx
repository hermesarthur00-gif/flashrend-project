import Link from "next/link";
import { IconBell, IconChartLine } from "@tabler/icons-react";
import { Logo } from "@/components/ui/logo";
import { AllocationDonut } from "@/components/ui/finance";
import { Alert, Badge, Card, IconTile, Page, SectionTitle } from "@/components/app/primitives";
import { ActivityList, BalanceCard, HoldingRow, toActivity } from "@/components/account/widgets";
import { ValueChart } from "@/components/account/value-chart";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/server/session";
import { getPortfolioSummary, getSnapshots } from "@/lib/server/portfolio";
import { db } from "@/lib/server/db";
import type { CryptoSymbol } from "@/lib/landing-data";
import { PROFILE_LABELS, PROFILE_RISK, formatMoney } from "@/lib/utils";

export default async function HomePage() {
  const user = await requireOnboardedUser();
  const [summary, activity, pendingDeposits, unread, series] = await Promise.all([
    getPortfolioSummary(user.id),
    db.activity.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.deposit.findMany({ where: { userId: user.id, status: "ANNOUNCED" }, orderBy: { announcedAt: "desc" } }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    getSnapshots(user.id),
  ]);
  const profile = user.profile!;
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" }).format(new Date());

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
        <Link href="/account/notifications" aria-label={unread ? `Notifications, ${unread} non lues` : "Notifications"} className="relative grid size-11 place-items-center rounded-md text-ink hover:bg-ink/8">
          <IconBell size={22} stroke={1.75} />
          {unread > 0 && <span aria-hidden="true" className="absolute top-2.5 right-2.5 size-2 rounded-full bg-down-fill" />}
        </Link>
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
            <ButtonLink href="/account/depot">Déposer</ButtonLink>
          </div>
        </div>

        {user.kycStatus === "PENDING" && (
          <Alert tone="warning" title="Vérification d'identité en cours">
            Vous pourrez déposer dès que votre identité sera validée. Nous vous prévenons par notification.
          </Alert>
        )}
        {pendingDeposits.map((d) => (
          <Alert key={d.id} tone="info" title={`Virement en ${d.currency} annoncé`} action={<Link href={`/account/depot/${d.id}`} className="text-sm font-semibold text-ink underline underline-offset-2">Suivre le dépôt</Link>}>
            Il sera placé dès réception sur le compte FlashInv. Réf. {d.reference}
            {d.receivedAmount ? `, ${formatMoney(Number(d.receivedAmount), d.currency)}` : ""}.
          </Alert>
        ))}

        <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-5 lg:col-span-5 lg:gap-6">
            <div className="lg:hidden">
              <BalanceCard total={summary.total} gain={summary.gain} />
            </div>
            <div className="hidden lg:block">
              <BalanceCard total={summary.total} gain={summary.gain} actions={false} />
            </div>
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
            {summary.items.length > 0 && (
              <Card className="hidden lg:block">
                <div className="mb-3.5 flex items-baseline justify-between">
                  <h2 className="text-h3 m-0">Répartition</h2>
                  <Badge tone="flash">
                    {PROFILE_LABELS[profile]} · {PROFILE_RISK[profile]}/5
                  </Badge>
                </div>
                <AllocationDonut items={summary.items.map((h) => ({ symbol: h.symbol as CryptoSymbol, value: h.valueUsd }))} />
              </Card>
            )}
          </div>
          <Card className="hidden lg:col-span-7 lg:block">
            <h2 className="text-h3 m-0 mb-3">Valeur du portefeuille</h2>
            <ValueChart series={series} label="Valeur du portefeuille" height={150} />
          </Card>

          <section className="flex flex-col gap-1 lg:col-span-7 lg:rounded-lg lg:border lg:border-line lg:bg-surface-raised lg:p-6">
            <SectionTitle title="Vos actifs" link="Portefeuille" href="/account/portefeuille" />
            {summary.items.length ? (
              summary.items.map((h) => <HoldingRow key={h.symbol} h={h} href={`/account/portefeuille/${h.symbol.toLowerCase()}`} />)
            ) : (
              <p className="m-0 py-4 text-ink-muted">
                Rien de placé pour l&apos;instant. Faites un premier virement : il sera réparti selon votre profil {PROFILE_LABELS[profile].toLowerCase()}.
              </p>
            )}
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
