import Link from "next/link";
import type { Prisma, WithdrawalStatus } from "@/generated/prisma/client";
import { Badge, StatusBadge } from "@/components/app/primitives";
import { AdminHead, EmptyRow, KV, LinkTabs, Person, SearchBox, Table } from "@/components/admin/ui";
import { CopyButton } from "@/components/app/form";
import { requireAdmin } from "@/lib/server/session";
import { getHoldings } from "@/lib/server/portfolio";
import { db } from "@/lib/server/db";
import { cn, formatDateTime, formatUSD } from "@/lib/utils";
import { RejectWithdrawalForm, SendWithdrawalForm } from "./withdrawal-forms";

export const metadata = { title: "Retraits" };

const TABS: { key: string; label: string; status?: WithdrawalStatus }[] = [
  { key: "a-envoyer", label: "À envoyer", status: "REQUESTED" },
  { key: "envoyes", label: "Envoyés", status: "SENT" },
  { key: "refuses", label: "Refusés", status: "REJECTED" },
  { key: "tous", label: "Tous" },
];
const STATUS = { REQUESTED: "pending", SENT: "done", REJECTED: "rejected" } as const;
const mask = (iban: string) => `${iban.slice(0, 4)} •••• ${iban.slice(-4)}`;

export default async function WithdrawalsPage({ searchParams }: PageProps<"/admin/retraits">) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.statut) ?? TABS[0];
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const where: Prisma.WithdrawalWhereInput = { ...(tab.status ? { status: tab.status } : {}) };
  if (q) where.OR = [{ reference: { contains: q, mode: "insensitive" } }, { user: { name: { contains: q, mode: "insensitive" } } }, { bankAccount: { iban: { contains: q.replace(/\s/g, ""), mode: "insensitive" } } }];
  const [rows, pending] = await Promise.all([
    db.withdrawal.findMany({ where, orderBy: { createdAt: tab.status === "REQUESTED" ? "asc" : "desc" }, take: 100, include: { user: true, bankAccount: true } }),
    db.withdrawal.count({ where: { status: "REQUESTED" } }),
  ]);
  const selectedId = typeof sp.id === "string" ? sp.id : tab.status === "REQUESTED" ? rows[0]?.id : undefined;
  const selected = selectedId ? await db.withdrawal.findUnique({ where: { id: selectedId }, include: { user: true, bankAccount: true } }) : null;
  const after = selected ? (await getHoldings(selected.userId)).total : 0;
  const keep = { ...(tab.key !== "a-envoyer" ? { statut: tab.key } : {}), ...(q ? { q } : {}) };

  return (
    <>
      <AdminHead title="Retraits" sub="Envoyez les virements demandés par les clients, puis confirmez l'envoi." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LinkTabs base="/admin/retraits" value={tab.key} extra={q ? { q } : undefined} items={TABS.map((t) => ({ key: t.key, label: t.label, count: t.status === "REQUESTED" ? pending : undefined }))} />
        <SearchBox placeholder="Référence, client, IBAN" value={q} hidden={{ statut: tab.key !== "a-envoyer" ? tab.key : undefined }} />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Table head={["Client", "Référence", "Vers", "Montant", "Demandé", "Statut"]} align={["left", "left", "left", "right", "left", "left"]}>
          {rows.length === 0 && <EmptyRow cols={6} text="Aucun retrait." />}
          {rows.map((w) => (
            <tr key={w.id} className={cn(selected?.id === w.id && "bg-flash-soft")}>
              <td>
                <Link href={`/admin/retraits?${new URLSearchParams({ ...keep, id: w.id })}`} className="text-ink">
                  <Person name={w.user.name} email={w.user.email} />
                </Link>
              </td>
              <td className="font-semibold">{w.reference}</td>
              <td className="whitespace-nowrap tabular-nums">{mask(w.bankAccount.iban)}</td>
              <td className="text-right font-bold tabular-nums">{formatUSD(Number(w.amountUsd))}</td>
              <td className="whitespace-nowrap">{formatDateTime(w.createdAt)}</td>
              <td><StatusBadge status={STATUS[w.status]} label={w.status === "SENT" ? "Envoyé" : undefined} /></td>
            </tr>
          ))}
        </Table>
        {selected ? (
          <aside className="flex flex-col gap-3.5 rounded-lg border-2 border-ink bg-surface-raised p-[22px]">
            <span className="text-overline text-ink-muted">{selected.status === "REQUESTED" ? "Retrait à envoyer" : "Retrait"}</span>
            <h2 className="text-h3 m-0">
              {selected.reference} · {selected.user.name}
            </h2>
            <div className="rounded-md bg-band p-4 text-on-band">
              <span className="text-caption text-flash">À VIRER</span>
              <p className="text-amount-lg m-0 mt-1 mb-1.5">{formatUSD(Number(selected.amountUsd))}</p>
              <span className="text-[13px] opacity-80">Frais de {formatUSD(Number(selected.feeUsd))} déjà prélevés sur le portefeuille</span>
            </div>
            <div>
              <KV label="Titulaire" value={selected.bankAccount.holder} />
              <div className="flex items-center gap-2 border-t border-line py-2 text-sm">
                <span className="text-ink-muted">IBAN</span>
                <span className="ml-auto text-right font-semibold [overflow-wrap:anywhere] tabular-nums">{selected.bankAccount.iban}</span>
                <CopyButton value={selected.bankAccount.iban} label="IBAN" />
              </div>
              {selected.bankAccount.bic && <KV label="BIC" value={selected.bankAccount.bic} />}
              {selected.bankAccount.bankName && <KV label="Banque" value={selected.bankAccount.bankName} />}
              <KV label="Confirmé par code" value={<Badge tone="up">Oui</Badge>} />
              <KV label="Solde actuel du client" value={formatUSD(after)} />
              {selected.bankReference && <KV label="Réf. du virement" value={selected.bankReference} />}
              {selected.sentAt && <KV label="Envoyé le" value={formatDateTime(selected.sentAt)} />}
              {selected.rejectReason && <KV label="Motif du refus" value={selected.rejectReason} />}
            </div>
            {selected.status === "REQUESTED" && (
              <>
                <SendWithdrawalForm id={selected.id} />
                <RejectWithdrawalForm id={selected.id} />
              </>
            )}
          </aside>
        ) : (
          <aside className="rounded-lg border border-dashed border-line-strong p-8 text-center text-ink-muted">Sélectionnez un retrait.</aside>
        )}
      </div>
    </>
  );
}
