import Link from "next/link";
import type { Prisma, RefundStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/app/primitives";
import { AdminHead, EmptyRow, KV, LinkTabs, Person, SearchBox, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { REFUND_REASONS, REFUND_STATUS } from "@/lib/refund";
import { cn, formatDateTime, formatEUR } from "@/lib/utils";
import { AcceptRefundForm, RejectRefundForm, SendRefundForm } from "./refund-forms";

export const metadata = { title: "Remboursements" };

const TABS: { key: string; label: string; statuses?: RefundStatus[] }[] = [
  { key: "a-traiter", label: "À traiter", statuses: ["REQUESTED", "ACCEPTED"] },
  { key: "rembourses", label: "Remboursés", statuses: ["REFUNDED"] },
  { key: "refuses", label: "Refusés", statuses: ["REJECTED"] },
  { key: "tous", label: "Tous" },
];

export default async function RefundsPage({ searchParams }: PageProps<"/admin/remboursements">) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.statut) ?? TABS[0];
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const where: Prisma.RefundRequestWhereInput = { ...(tab.statuses ? { status: { in: tab.statuses } } : {}) };
  if (q) where.OR = [{ reference: { contains: q, mode: "insensitive" } }, { user: { name: { contains: q, mode: "insensitive" } } }, { user: { email: { contains: q, mode: "insensitive" } } }];
  const [rows, pending] = await Promise.all([
    db.refundRequest.findMany({ where, orderBy: { createdAt: tab.key === "a-traiter" ? "asc" : "desc" }, take: 100, include: { user: true } }),
    db.refundRequest.count({ where: { status: { in: ["REQUESTED", "ACCEPTED"] } } }),
  ]);
  const selectedId = typeof sp.id === "string" ? sp.id : tab.key === "a-traiter" ? rows[0]?.id : undefined;
  const selected = selectedId ? await db.refundRequest.findUnique({ where: { id: selectedId }, include: { user: true, deposit: true } }) : null;
  const keep = { ...(tab.key !== "a-traiter" ? { statut: tab.key } : {}), ...(q ? { q } : {}) };

  return (
    <>
      <AdminHead title="Remboursements" sub="Dépôts crédités par erreur : acceptez, renvoyez les fonds à la source, puis confirmez." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LinkTabs base="/admin/remboursements" value={tab.key} extra={q ? { q } : undefined} items={TABS.map((t) => ({ key: t.key, label: t.label, count: t.key === "a-traiter" ? pending : undefined }))} />
        <SearchBox placeholder="Référence, client" value={q} hidden={{ statut: tab.key !== "a-traiter" ? tab.key : undefined }} />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Table head={["Client", "Référence", "Motif", "Montant", "Demandé", "Statut"]} align={["left", "left", "left", "right", "left", "left"]}>
          {rows.length === 0 && <EmptyRow cols={6} text="Aucune demande." />}
          {rows.map((r) => (
            <tr key={r.id} className={cn(selected?.id === r.id && "bg-flash-soft")}>
              <td>
                <Link href={`/admin/remboursements?${new URLSearchParams({ ...keep, id: r.id })}`} className="text-ink">
                  <Person name={r.user.name} email={r.user.email} />
                </Link>
              </td>
              <td className="font-semibold">{r.reference}</td>
              <td>{REFUND_REASONS[r.reason]}</td>
              <td className="text-right font-bold tabular-nums">{formatEUR(Number(r.amountEur))}</td>
              <td className="whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
              <td><Badge tone={REFUND_STATUS[r.status].tone}>{REFUND_STATUS[r.status].label}</Badge></td>
            </tr>
          ))}
        </Table>
        {selected ? (
          <aside className="flex flex-col gap-3.5 rounded-lg border-2 border-ink bg-surface-raised p-[22px]">
            <span className="text-overline text-ink-muted">Remboursement</span>
            <h2 className="text-h3 m-0">
              {selected.reference} · {selected.user.name}
            </h2>
            <div className="rounded-md bg-band p-4 text-on-band">
              <span className="text-caption text-flash">À RENDRE</span>
              <p className="text-amount-lg m-0 mt-1 mb-1.5">{formatEUR(Number(selected.amountEur))}</p>
              <span className="text-[13px] opacity-80">Déjà mis de côté sur le solde du client</span>
            </div>
            <div>
              <KV label="Statut" value={<Badge tone={REFUND_STATUS[selected.status].tone}>{REFUND_STATUS[selected.status].label}</Badge>} />
              <KV label="Motif" value={REFUND_REASONS[selected.reason]} />
              {selected.details && <KV label="Précisions" value={selected.details} />}
              <KV label="Dépôt d'origine" value={<Link href={`/admin/depots?id=${selected.depositId}`} className="font-semibold underline underline-offset-2">{selected.deposit.reference}</Link>} />
              {selected.deposit.receivedAt && <KV label="Crédité le" value={formatDateTime(selected.deposit.receivedAt)} />}
              {selected.bankReference && <KV label="Réf. du virement" value={selected.bankReference} />}
              {selected.adminNote && <KV label="Motif du refus" value={selected.adminNote} />}
            </div>
            <p className="m-0 text-sm text-ink-muted">Le compte source se trouve dans la preuve du dépôt d&apos;origine.</p>
            {selected.status === "REQUESTED" && <AcceptRefundForm id={selected.id} />}
            {selected.status === "ACCEPTED" && <SendRefundForm id={selected.id} />}
            {(selected.status === "REQUESTED" || selected.status === "ACCEPTED") && <RejectRefundForm id={selected.id} />}
          </aside>
        ) : (
          <aside className="rounded-lg border border-dashed border-line-strong p-8 text-center text-ink-muted">Sélectionnez une demande.</aside>
        )}
      </div>
    </>
  );
}
