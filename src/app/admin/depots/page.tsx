import Link from "next/link";
import type { DepositStatus, Prisma } from "@/generated/prisma/client";
import { StatusBadge } from "@/components/app/primitives";
import { AdminHead, EmptyRow, KV, LinkTabs, Person, SearchBox, Table } from "@/components/admin/ui";
import { Stripes } from "@/components/ui/decor";
import { requireAdmin } from "@/lib/server/session";
import { getSettings } from "@/lib/server/settings";
import { db } from "@/lib/server/db";
import { cn, formatDateTime, formatMoney, formatUSD } from "@/lib/utils";
import { ReconcileForm, RejectDepositForm, UnannouncedForm } from "./deposit-forms";
import { DocViewer } from "../verifications/doc-viewer";

export const metadata = { title: "Dépôts" };

const TABS: { key: string; label: string; status?: DepositStatus }[] = [
  { key: "a-rapprocher", label: "À vérifier", status: "ANNOUNCED" },
  { key: "places", label: "Crédités", status: "CREDITED" },
  { key: "refuses", label: "Refusés", status: "REJECTED" },
  { key: "tous", label: "Tous" },
];
const STATUS = { ANNOUNCED: "pending", CREDITED: "done", REJECTED: "rejected" } as const;
const METHOD = { STANDARD: "Classique", INSTANT: "Instantané" } as const;

export default async function DepositsPage({ searchParams }: PageProps<"/admin/depots">) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.statut) ?? TABS[0];
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const where: Prisma.DepositWhereInput = { ...(tab.status ? { status: tab.status } : {}) };
  if (q) where.OR = [{ reference: { contains: q, mode: "insensitive" } }, { user: { name: { contains: q, mode: "insensitive" } } }, { user: { email: { contains: q, mode: "insensitive" } } }];
  const [rows, pending, settings] = await Promise.all([
    db.deposit.findMany({ where, orderBy: { announcedAt: tab.status === "ANNOUNCED" ? "asc" : "desc" }, take: 100, include: { user: true } }),
    db.deposit.count({ where: { status: "ANNOUNCED" } }),
    getSettings(),
  ]);
  const selected = typeof sp.id === "string" ? await db.deposit.findUnique({ where: { id: sp.id }, include: { user: true } }) : null;
  const keep = { ...(tab.key !== "a-rapprocher" ? { statut: tab.key } : {}), ...(q ? { q } : {}) };

  return (
    <>
      <AdminHead title="Dépôts" sub="Vérifiez que chaque virement déclaré est bien arrivé sur le compte FlashInv, puis créditez ou refusez." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LinkTabs base="/admin/depots" value={tab.key} extra={q ? { q } : undefined} items={TABS.map((t) => ({ key: t.key, label: t.label, count: t.status === "ANNOUNCED" ? pending : undefined }))} />
        <SearchBox placeholder="Référence, client" value={q} hidden={{ statut: tab.key !== "a-rapprocher" ? tab.key : undefined }} />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Table head={["Client", "Référence", "Mode", "Montant", "Date", "Statut"]} align={["left", "left", "left", "right", "left", "left"]}>
          {rows.length === 0 && <EmptyRow cols={6} text="Aucun dépôt." />}
          {rows.map((d) => (
            <tr key={d.id} className={cn(selected?.id === d.id && "bg-flash-soft")}>
              <td>
                <Link href={`/admin/depots?${new URLSearchParams({ ...keep, id: d.id })}`} className="text-ink">
                  <Person name={d.user.name} email={d.user.email} />
                </Link>
              </td>
              <td className="font-bold">{d.reference}</td>
              <td>{METHOD[d.method]}</td>
              <td className="text-right font-semibold tabular-nums">{d.receivedAmount ? formatMoney(Number(d.receivedAmount), d.currency) : d.declaredAmount ? formatMoney(Number(d.declaredAmount), d.currency) : d.currency}</td>
              <td className="whitespace-nowrap">{formatDateTime(d.receivedAt ?? d.announcedAt)}</td>
              <td><StatusBadge status={STATUS[d.status]} label={d.status === "CREDITED" ? "Crédité" : d.status === "ANNOUNCED" ? "À vérifier" : undefined} /></td>
            </tr>
          ))}
        </Table>
        <aside className="relative flex flex-col gap-3.5 overflow-hidden rounded-lg border-2 border-ink bg-surface-raised p-[22px]">
          <div className="pointer-events-none absolute -top-1.5 -right-1.5">
            <Stripes count={4} height={48} />
          </div>
          {selected ? (
            <>
              <span className="text-overline text-ink-muted">{selected.status === "ANNOUNCED" ? "Dépôt à vérifier" : "Dépôt"}</span>
              <h2 className="text-h3 m-0">
                {selected.reference} · {selected.user.name}
              </h2>
              <div>
                <KV label="Mode" value={`Virement ${METHOD[selected.method].toLowerCase()}`} />
                {selected.declaredAmount && <KV label="Montant déclaré" value={formatMoney(Number(selected.declaredAmount), selected.currency)} />}
                <KV label="Déclaré le" value={formatDateTime(selected.announcedAt)} />
                {selected.receivedAmount && <KV label="Montant reçu" value={formatMoney(Number(selected.receivedAmount), selected.currency)} />}
                {selected.creditedUsd && <KV label="Crédité" value={formatUSD(Number(selected.creditedUsd))} />}
                {selected.fxRate && <KV label="Taux appliqué" value={Number(selected.fxRate).toLocaleString("fr-FR", { maximumFractionDigits: 6 })} />}
                {selected.note && <KV label="Raison du refus" value={selected.note} />}
              </div>
              {selected.proofId ? <DocViewer src={`/admin/documents/${selected.id}/preuve`} label="Preuve du virement" /> : <p className="m-0 text-sm text-ink-muted">Pas de preuve jointe (virement enregistré par un admin).</p>}
              {selected.status === "ANNOUNCED" && (
                <>
                  <ReconcileForm id={selected.id} currency={selected.currency} defaultRate={settings.money.eurUsdRate} declared={selected.declaredAmount ? Number(selected.declaredAmount) : null} />
                  <RejectDepositForm id={selected.id} />
                </>
              )}
            </>
          ) : (
            <>
              <span className="text-overline text-ink-muted">Virement sans annonce</span>
              <h2 className="text-h3 m-0">Enregistrer un virement reçu</h2>
              <p className="m-0 text-sm text-ink-muted">Pour un virement reçu avec une référence client mais non déclaré dans l&apos;app. Sélectionnez une ligne pour vérifier un dépôt déclaré.</p>
              <UnannouncedForm defaultRate={settings.money.eurUsdRate} />
            </>
          )}
        </aside>
      </div>
    </>
  );
}
