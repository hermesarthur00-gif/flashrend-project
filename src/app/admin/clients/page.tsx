import type { Prisma } from "@/generated/prisma/client";
import { Badge } from "@/components/app/primitives";
import { AdminHead, EmptyRow, LinkTabs, Person, SearchBox, Table } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/server/session";
import { priceMap } from "@/lib/server/portfolio";
import { db } from "@/lib/server/db";
import { PROFILE_LABELS, formatDate, formatUSD } from "@/lib/utils";
import { isAnonymized } from "@/lib/account-status";

export const metadata = { title: "Clients" };

const PAGE = 25;
const KYC_BADGE = { NONE: ["Non commencée", "neutral"], PENDING: ["À vérifier", "warning"], APPROVED: ["Vérifié", "up"], REJECTED: ["Refusé", "down"] } as const;

export default async function ClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = typeof sp.statut === "string" ? sp.statut : "tous";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.UserWhereInput = { role: "CLIENT" };
  if (tab === "actifs") Object.assign(where, { kycStatus: "APPROVED", suspendedAt: null });
  if (tab === "a-verifier") Object.assign(where, { kycStatus: "PENDING" });
  if (tab === "suspendus") Object.assign(where, { suspendedAt: { not: null }, NOT: { email: { endsWith: "@supprime.flashinv.invalid" } } });
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { reference: { contains: q, mode: "insensitive" } }];

  const [users, total, counts, pm] = await Promise.all([
    db.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, include: { positions: true } }),
    db.user.count({ where }),
    Promise.all([
      db.user.count({ where: { role: "CLIENT", kycStatus: "APPROVED", suspendedAt: null } }),
      db.user.count({ where: { role: "CLIENT", kycStatus: "PENDING" } }),
      db.user.count({ where: { role: "CLIENT", suspendedAt: { not: null }, NOT: { email: { endsWith: "@supprime.flashinv.invalid" } } } }),
    ]),
    priceMap(),
  ]);
  const value = (u: (typeof users)[number]) => Number(u.cashUsd) + u.positions.reduce((s, p) => s + Number(p.quantity) * (pm.get(p.symbol)?.priceUsd ?? 0), 0);
  const qs = (p: number) => new URLSearchParams({ ...(tab !== "tous" ? { statut: tab } : {}), ...(q ? { q } : {}), page: String(p) }).toString();

  return (
    <>
      <AdminHead title="Clients" sub={`${counts[0]} actifs · ${counts[1]} à vérifier · ${counts[2]} banni${counts[2] > 1 ? "s" : ""}`} actions={<ButtonLink href="/admin/clients/export" variant="secondary" prefetch={false}>Exporter en CSV</ButtonLink>} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LinkTabs
          base="/admin/clients"
          value={tab}
          extra={q ? { q } : undefined}
          items={[
            { key: "tous", label: "Tous" },
            { key: "actifs", label: "Actifs" },
            { key: "a-verifier", label: "À vérifier", count: counts[1] },
            { key: "suspendus", label: "Bannis" },
          ]}
        />
        <SearchBox placeholder="Nom, e-mail, référence" value={q} hidden={{ statut: tab !== "tous" ? tab : undefined }} />
      </div>
      <Table head={["Client", "Référence", "Profil", "Identité", "Solde", "Inscrit le", ""]} align={["left", "left", "left", "left", "right", "left", "right"]}>
        {users.length === 0 && <EmptyRow cols={7} text="Aucun client ne correspond." />}
        {users.map((u) => {
          const k = isAnonymized(u.email) ? (["Supprimé", "neutral"] as const) : u.suspendedAt ? (["Banni", "down"] as const) : KYC_BADGE[u.kycStatus];
          return (
            <tr key={u.id}>
              <td><Person name={u.name} email={u.email} /></td>
              <td className="font-semibold">{u.reference}</td>
              <td>{u.profile ? PROFILE_LABELS[u.profile] : <span className="text-ink-muted">Non choisi</span>}</td>
              <td><Badge tone={k[1]}>{k[0]}</Badge></td>
              <td className="text-right font-semibold tabular-nums">{formatUSD(value(u))}</td>
              <td className="whitespace-nowrap">{formatDate(u.createdAt)}</td>
              <td className="text-right"><ButtonLink href={`/admin/clients/${u.id}`} variant="ghost" size="sm">Ouvrir</ButtonLink></td>
            </tr>
          );
        })}
      </Table>
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>
          {total ? `${(page - 1) * PAGE + 1} à ${Math.min(page * PAGE, total)} sur ${total}` : "0 client"}
        </span>
        <div className="flex gap-2">
          {page > 1 && <ButtonLink href={`/admin/clients?${qs(page - 1)}`} variant="secondary" size="sm">Précédent</ButtonLink>}
          {page * PAGE < total && <ButtonLink href={`/admin/clients?${qs(page + 1)}`} variant="secondary" size="sm">Suivant</ButtonLink>}
        </div>
      </div>
    </>
  );
}
