import Link from "next/link";
import { AdminHead, EmptyRow, Kpi, Panel, Person, Table, KV, relDays } from "@/components/admin/ui";
import { PortfolioLiveChart } from "@/components/live/live-chart";
import { LiveAum } from "@/components/live/live-widgets";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/server/session";
import { getAumParts, getFlows } from "@/lib/server/portfolio";
import { db } from "@/lib/server/db";
import { PROFILE_LABELS, daysAgo, formatDateTime, formatMoney, formatUSD } from "@/lib/utils";

export const metadata = { title: "Tableau de bord" };

export default async function AdminDashboard() {
  await requireAdmin();
  const since = daysAgo(90);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [flows, parts, active, newThisMonth, kycPending, oldestKyc, deposits, withdrawals, wdSum, byProfile, snaps] = await Promise.all([
    getFlows(),
    getAumParts(),
    db.user.count({ where: { role: "CLIENT", kycStatus: "APPROVED", suspendedAt: null } }),
    db.user.count({ where: { role: "CLIENT", createdAt: { gte: monthStart } } }),
    db.kycSubmission.count({ where: { status: "PENDING" } }),
    db.kycSubmission.findFirst({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
    db.deposit.findMany({ where: { status: "ANNOUNCED" }, orderBy: { announcedAt: "asc" }, take: 5, include: { user: true } }),
    db.withdrawal.findMany({ where: { status: "REQUESTED" }, orderBy: { createdAt: "asc" }, take: 5, include: { user: true, bankAccount: true } }),
    db.withdrawal.aggregate({ where: { status: "REQUESTED" }, _sum: { amountUsd: true }, _count: true }),
    db.user.groupBy({ by: ["profile"], where: { role: "CLIENT", profile: { not: null } }, _count: true }),
    db.portfolioSnapshot.groupBy({ by: ["day"], where: { day: { gte: since } }, _sum: { valueUsd: true }, orderBy: { day: "asc" } }),
  ]);
  const series = snaps.map((s) => ({ t: s.day.getTime(), v: Number(s._sum.valueUsd ?? 0) }));
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }).format(new Date());
  const pc = (p: "CAREFUL" | "BALANCED" | "BOLD") => byProfile.find((b) => b.profile === p)?._count ?? 0;

  return (
    <>
      <AdminHead title="Tableau de bord" sub={<span className="first-letter:uppercase">{today}</span>} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <Kpi label="Encours total" value={<LiveAum quantities={parts.quantities} cash={parts.cash} />} sub={`dont ${formatUSD(parts.cash)} non investis`} />
        <Kpi label="Clients actifs" value={String(active)} sub={`+${newThisMonth} inscrits ce mois`} tone="up" href="/admin/clients" />
        <Kpi label="Vérifications à faire" value={String(kycPending)} sub={oldestKyc ? `La plus ancienne : ${relDays(oldestKyc.createdAt)}` : "Rien en attente"} tone={kycPending ? "warn" : undefined} href="/admin/verifications" />
        <Kpi label="Dépôts à vérifier" value={String(deposits.length)} sub={deposits.length ? "Virements déclarés" : "Rien en attente"} tone={deposits.length ? "warn" : undefined} href="/admin/depots" />
        <Kpi label="Retraits à envoyer" value={String(wdSum._count)} sub={wdSum._count ? `${formatUSD(Number(wdSum._sum.amountUsd ?? 0))} au total` : "Rien en attente"} tone={wdSum._count ? "warn" : undefined} href="/admin/retraits" />
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-8">
          <PortfolioLiveChart positions={parts.quantities.map((q) => ({ ...q, name: q.symbol }))} daily={series} flows={flows} title="Encours investi" height={160} />
        </Panel>
        <Panel title="Clients par profil" className="lg:col-span-4">
          <div>
            {(["CAREFUL", "BALANCED", "BOLD"] as const).map((p) => (
              <KV key={p} label={PROFILE_LABELS[p]} value={`${pc(p)} client${pc(p) > 1 ? "s" : ""}`} />
            ))}
          </div>
          <ButtonLink href="/admin/profils" variant="secondary" size="sm" className="self-start">
            Répartitions
          </ButtonLink>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Dépôts à vérifier" right={<Link href="/admin/depots" className="text-sm font-semibold">Tout voir</Link>}>
          <Table head={["Client", "Montant", "Déclaré", ""]} align={["left", "left", "left", "right"]}>
            {deposits.length === 0 && <EmptyRow cols={4} text="Aucun virement en attente." />}
            {deposits.map((d) => (
              <tr key={d.id}>
                <td><Person name={d.user.name} email={d.user.email} /></td>
                <td className="font-bold">{d.declaredAmount ? formatMoney(Number(d.declaredAmount), d.currency) : d.currency}</td>
                <td className="whitespace-nowrap">{formatDateTime(d.announcedAt)}</td>
                <td className="text-right"><ButtonLink href={`/admin/depots?id=${d.id}`} variant="secondary" size="sm">Vérifier</ButtonLink></td>
              </tr>
            ))}
          </Table>
        </Panel>
        <Panel title="Retraits à envoyer" right={<Link href="/admin/retraits" className="text-sm font-semibold">Tout voir</Link>}>
          <Table head={["Client", "Montant", "Demandé", ""]} align={["left", "right", "left", "right"]}>
            {withdrawals.length === 0 && <EmptyRow cols={4} text="Aucun retrait à envoyer." />}
            {withdrawals.map((w) => (
              <tr key={w.id}>
                <td><Person name={w.user.name} email={w.user.email} /></td>
                <td className="text-right font-bold tabular-nums">{formatUSD(Number(w.amountUsd))}</td>
                <td className="whitespace-nowrap">{formatDateTime(w.createdAt)}</td>
                <td className="text-right"><ButtonLink href={`/admin/retraits?id=${w.id}`} variant="secondary" size="sm">Traiter</ButtonLink></td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
    </>
  );
}
