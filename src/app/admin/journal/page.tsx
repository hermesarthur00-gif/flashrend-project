import Link from "next/link";
import { AdminHead, EmptyRow, Person, Table } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Journal" };

const LABELS: Record<string, string> = {
  "client.suspend": "Compte banni",
  "client.delete": "Compte supprimé",
  "client.anonymize": "Compte anonymisé",
  "client.reactivate": "Compte réactivé",
  "clients.export": "Export des clients",
  "kyc.approve": "Identité validée",
  "kyc.reject": "Identité refusée",
  "kyc.document.view": "Document d'identité consulté",
  "deposit.invest": "Dépôt placé",
  "deposit.credit": "Dépôt crédité",
  "deposit.proof.view": "Preuve de virement consultée",
  "deposit.reject": "Dépôt refusé",
  "withdrawal.sent": "Retrait envoyé",
  "withdrawal.reject": "Retrait refusé",
  "profile.allocation": "Répartition modifiée",
  "flash.offer.create": "Offre Flash créée",
  "flash.offer.update": "Offre Flash modifiée",
  "flash.offer.close": "Offre Flash fermée",
  "flash.offer.open": "Offre Flash rouverte",
  "flash.offer.delete": "Offre Flash supprimée",
  "flash.settle": "Flash clôturés à la main",
  "settings.legal": "Informations légales modifiées",
  "settings.contact": "Contact modifié",
  "settings.money": "Frais et délais modifiés",
  "settings.bank": "Coordonnées bancaires modifiées",
  "team.add": "Administrateur ajouté",
  "team.remove": "Administrateur retiré",
};

const PAGE = 50;

export default async function JournalPage({ searchParams }: PageProps<"/admin/journal">) {
  await requireAdmin();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [rows, total] = await Promise.all([db.auditLog.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, include: { actor: true } }), db.auditLog.count()]);
  const targets = await db.user.findMany({ where: { id: { in: rows.filter((r) => r.targetType === "user").map((r) => r.targetId!) } }, select: { id: true, name: true } });

  return (
    <>
      <AdminHead title="Journal" sub="Toutes les actions sensibles faites dans l'admin." />
      <Table head={["Date", "Par", "Action", "Cible", "Détail"]}>
        {rows.length === 0 && <EmptyRow cols={5} text="Aucune action enregistrée." />}
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
            <td><Person name={r.actor.name} size={28} /></td>
            <td className="font-semibold">{LABELS[r.action] ?? r.action}</td>
            <td>
              {r.targetType === "user" && r.targetId ? (
                <Link href={`/admin/clients/${r.targetId}`}>{targets.find((t) => t.id === r.targetId)?.name ?? "Client"}</Link>
              ) : (
                (r.targetId ?? "")
              )}
            </td>
            <td className="max-w-[360px] truncate text-xs text-ink-muted" title={r.data ? JSON.stringify(r.data) : undefined}>
              {r.data ? JSON.stringify(r.data) : ""}
            </td>
          </tr>
        ))}
      </Table>
      <div className="flex justify-end gap-2">
        {page > 1 && <ButtonLink href={`/admin/journal?page=${page - 1}`} variant="secondary" size="sm">Plus récents</ButtonLink>}
        {page * PAGE < total && <ButtonLink href={`/admin/journal?page=${page + 1}`} variant="secondary" size="sm">Plus anciens</ButtonLink>}
      </div>
    </>
  );
}
