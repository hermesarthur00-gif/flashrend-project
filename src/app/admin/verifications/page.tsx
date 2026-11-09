import Link from "next/link";
import { Badge, StatusBadge } from "@/components/app/primitives";
import { AdminHead, KV, LinkTabs, Person, relDays } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import type { KycStatus } from "@/generated/prisma/client";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { KycDecision } from "./kyc-decision";

export const metadata = { title: "Vérifications" };

const TABS: { key: string; label: string; status: KycStatus }[] = [
  { key: "attente", label: "En attente", status: "PENDING" },
  { key: "validees", label: "Validées", status: "APPROVED" },
  { key: "refusees", label: "Refusées", status: "REJECTED" },
];

function Doc({ id, side, label }: { id: string; side: string; label: string }) {
  const src = `/admin/documents/${id}/${side}`;
  return (
    <figure className="m-0 flex flex-col gap-2">
      <a href={src} target="_blank" rel="noreferrer" className="grid aspect-[4/3] place-items-center overflow-hidden rounded-lg bg-band">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="size-full object-contain" loading="lazy" />
      </a>
      <figcaption className="flex justify-between text-[13px]">
        <span className="font-semibold">{label}</span>
        <a href={src} target="_blank" rel="noreferrer">
          Agrandir
        </a>
      </figcaption>
    </figure>
  );
}

export default async function VerificationsPage({ searchParams }: PageProps<"/admin/verifications">) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.statut) ?? TABS[0];
  const [list, pendingCount] = await Promise.all([
    db.kycSubmission.findMany({ where: { status: tab.status }, orderBy: { createdAt: tab.status === "PENDING" ? "asc" : "desc" }, take: 50, include: { user: true } }),
    db.kycSubmission.count({ where: { status: "PENDING" } }),
  ]);
  const selected = (typeof sp.id === "string" ? await db.kycSubmission.findUnique({ where: { id: sp.id }, include: { user: true, reviewer: true } }) : null) ?? (list[0] ? await db.kycSubmission.findUnique({ where: { id: list[0].id }, include: { user: true, reviewer: true } }) : null);

  return (
    <>
      <AdminHead title="Vérifications d'identité" sub={`${pendingCount} dossier${pendingCount > 1 ? "s" : ""} en attente`} />
      <LinkTabs base="/admin/verifications" value={tab.key} items={TABS.map((t) => ({ ...t, count: t.status === "PENDING" ? pendingCount : undefined }))} />
      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-col gap-1 rounded-lg border border-line bg-surface-raised p-2">
          {list.length === 0 && <p className="m-0 p-4 text-center text-ink-muted">Aucun dossier.</p>}
          {list.map((k) => (
            <Link
              key={k.id}
              href={`/admin/verifications?${new URLSearchParams({ ...(tab.key !== "attente" ? { statut: tab.key } : {}), id: k.id })}`}
              aria-current={selected?.id === k.id ? "true" : undefined}
              className={cn("flex items-center gap-3 rounded-md border p-3 text-ink", selected?.id === k.id ? "border-ink bg-flash-soft" : "border-transparent hover:bg-surface-sunken")}
            >
              <Person name={k.user.name} email={`Soumis ${relDays(k.createdAt)}`} />
              <span className="ml-auto">
                <StatusBadge status={k.status === "PENDING" ? "pending" : k.status === "APPROVED" ? "done" : "rejected"} label={k.status === "APPROVED" ? "Validé" : undefined} />
              </span>
            </Link>
          ))}
        </div>
        {selected ? (
          <section className="flex min-w-0 flex-col gap-[18px] rounded-lg border border-line bg-surface-raised p-[22px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-h2 m-0">{selected.user.name}</h2>
                <p className="m-0 mt-0.5 text-sm text-ink-muted">
                  <Link href={`/admin/clients/${selected.userId}`}>{selected.user.email}</Link> · inscrit le {formatDate(selected.user.createdAt)}
                </p>
              </div>
              <Badge>{selected.docType === "id" ? "Carte d'identité" : "Passeport"}</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Doc id={selected.id} side="recto" label={selected.docType === "id" ? "Recto" : "Page photo"} />
              {selected.backId && <Doc id={selected.id} side="verso" label="Verso" />}
              <Doc id={selected.id} side="selfie" label="Selfie" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-label m-0 mb-1">Informations déclarées</h3>
                <KV label="Nom complet" value={`${selected.user.firstName ?? ""} ${selected.user.lastName ?? ""}`} />
                <KV label="Date de naissance" value={new Date(selected.birthDate).toLocaleDateString("fr-FR")} />
                <KV label="Adresse" value={`${selected.address}, ${selected.postalCode} ${selected.city}`} />
                <KV label="Pays de résidence" value={selected.country} />
                <KV label="Soumis le" value={formatDateTime(selected.createdAt)} />
              </div>
              {selected.status === "PENDING" ? (
                <KycDecision id={selected.id} />
              ) : (
                <div>
                  <h3 className="text-label m-0 mb-1">Décision</h3>
                  <KV label="Statut" value={selected.status === "APPROVED" ? "Validé" : "Refusé"} />
                  {selected.reviewedAt && <KV label="Le" value={formatDateTime(selected.reviewedAt)} />}
                  {selected.reviewer && <KV label="Par" value={selected.reviewer.name} />}
                  {selected.rejectReason && <KV label="Motif" value={selected.rejectReason} />}
                </div>
              )}
            </div>
          </section>
        ) : (
          <p className="m-0 rounded-lg border border-dashed border-line-strong p-10 text-center text-ink-muted">Sélectionnez un dossier.</p>
        )}
      </div>
    </>
  );
}
