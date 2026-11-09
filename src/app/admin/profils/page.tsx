import { Alert } from "@/components/app/primitives";
import { AdminHead, EmptyRow, Panel, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { PROFILE_LABELS, formatDate } from "@/lib/utils";
import { AllocationEditor } from "./allocation-editor";

export const metadata = { title: "Profils" };

export default async function ProfilesPage() {
  await requireAdmin();
  const [assets, allocations, history, counts] = await Promise.all([
    db.asset.findMany({ where: { active: true }, orderBy: { symbol: "asc" } }),
    db.profileAllocation.findMany(),
    db.rebalance.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    db.user.groupBy({ by: ["profile"], where: { profile: { not: null } }, _count: true }),
  ]);
  const actors = await db.user.findMany({ where: { id: { in: history.map((h) => h.actorId) } }, select: { id: true, name: true } });

  return (
    <>
      <AdminHead title="Profils et répartition" sub="Répartition cible de chaque profil. Les nouveaux dépôts suivent ces valeurs." />
      <Alert tone="warning" title="Le rééquilibrage s'applique à tous les clients du profil">
        Cochez « Rééquilibrer » pour échanger les cryptos des clients existants aux cours du moment. Ils sont notifiés et le changement apparaît dans leur historique.
      </Alert>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        {(["CAREFUL", "BALANCED", "BOLD"] as const).map((p) => (
          <AllocationEditor
            key={p}
            profile={p}
            clients={counts.find((c) => c.profile === p)?._count ?? 0}
            assets={assets.map((a) => ({ symbol: a.symbol, name: a.name }))}
            initial={Object.fromEntries(allocations.filter((a) => a.profile === p).map((a) => [a.symbol, Number(a.percent)]))}
          />
        ))}
      </div>
      <Panel title="Derniers changements">
        <Table head={["Date", "Profil", "Répartition", "Clients rééquilibrés", "Par"]}>
          {history.length === 0 && <EmptyRow cols={5} text="Aucun changement pour l'instant." />}
          {history.map((h) => (
            <tr key={h.id}>
              <td className="whitespace-nowrap">{formatDate(h.createdAt)}</td>
              <td>{PROFILE_LABELS[h.profile]}</td>
              <td>{h.summary}</td>
              <td>{h.clients}</td>
              <td>{actors.find((a) => a.id === h.actorId)?.name ?? ""}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
