import type { Metadata } from "next";
import Link from "next/link";
import { Card, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { ActivityList, toActivity } from "@/components/account/widgets";
import { requireOnboardedUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import type { ActivityType } from "@/generated/prisma/client";
import { cn, formatUSD } from "@/lib/utils";

export const metadata: Metadata = { title: "Activité" };

const FILTERS: { key: string; label: string; types?: ActivityType[] }[] = [
  { key: "tout", label: "Tout" },
  { key: "depots", label: "Dépôts", types: ["DEPOSIT"] },
  { key: "investissements", label: "Investissements", types: ["INVEST", "DIVEST", "REBALANCE", "PROFILE"] },
  { key: "retraits", label: "Retraits", types: ["WITHDRAW"] },
];

export default async function ActivityPage({ searchParams }: PageProps<"/account/activite">) {
  const user = await requireOnboardedUser();
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.key === sp.filtre) ?? FILTERS[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [rows, dep, wd] = await Promise.all([
    db.activity.findMany({ where: { userId: user.id, ...(filter.types ? { type: { in: filter.types } } : {}) }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.deposit.aggregate({ where: { userId: user.id, status: "CREDITED", receivedAt: { gte: monthStart } }, _sum: { creditedUsd: true } }),
    db.withdrawal.aggregate({ where: { userId: user.id, status: { not: "REJECTED" }, createdAt: { gte: monthStart } }, _sum: { amountUsd: true } }),
  ]);

  return (
    <>
      <TopBar title="Activité" />
      <Page narrow>
        <PageHeading title="Activité" />
        <nav aria-label="Filtrer" className="flex rounded-md bg-surface-sunken p-0.5">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "tout" ? "/account/activite" : `/account/activite?filtre=${f.key}`}
              aria-current={f.key === filter.key ? "page" : undefined}
              className={cn("flex h-9 flex-1 items-center justify-center rounded-sm text-sm font-semibold", f.key === filter.key ? "bg-surface-raised text-ink" : "text-ink-muted")}
            >
              {f.label}
            </Link>
          ))}
        </nav>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3.5 lg:p-5">
            <span className="text-caption text-ink-muted">Déposé ce mois</span>
            <p className="text-amount m-0 mt-1 text-lg">{formatUSD(Number(dep._sum.creditedUsd ?? 0))}</p>
          </Card>
          <Card className="p-3.5 lg:p-5">
            <span className="text-caption text-ink-muted">Retiré ce mois</span>
            <p className="text-amount m-0 mt-1 text-lg">{formatUSD(Number(wd._sum.amountUsd ?? 0))}</p>
          </Card>
        </div>
        <ActivityList items={toActivity(rows)} />
      </Page>
    </>
  );
}
