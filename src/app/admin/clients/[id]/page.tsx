import Link from "next/link";
import { notFound } from "next/navigation";
import { IconChevronLeft } from "@tabler/icons-react";
import { Badge } from "@/components/app/primitives";
import { AdminHead, KV, Kpi, Panel, Table, EmptyRow } from "@/components/admin/ui";
import { ActivityList, toActivity } from "@/components/account/widgets";
import { requireAdmin } from "@/lib/server/session";
import { getPortfolioSummary } from "@/lib/server/portfolio";
import { db } from "@/lib/server/db";
import { PROFILE_LABELS, PROFILE_RISK, formatDate, formatDateTime, formatQty, formatUSD } from "@/lib/utils";
import { AccountManagement } from "./client-actions";
import { isAnonymized } from "@/lib/account-status";

export const metadata = { title: "Fiche client" };

const KYC = { NONE: ["Non commencée", "neutral"], PENDING: ["À vérifier", "warning"], APPROVED: ["Vérifiée", "up"], REJECTED: ["Refusée", "down"] } as const;

export default async function ClientPage({ params }: PageProps<"/admin/clients/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id }, include: { bankAccounts: true } });
  if (!user) notFound();
  const [summary, activity, kyc, pendingDeposits, pendingWd, lastSession, sessions] = await Promise.all([
    getPortfolioSummary(id),
    db.activity.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 15 }),
    db.kycSubmission.findFirst({ where: { userId: id }, orderBy: { createdAt: "desc" }, include: { reviewer: true } }),
    db.deposit.count({ where: { userId: id, status: "ANNOUNCED" } }),
    db.withdrawal.aggregate({ where: { userId: id, status: "REQUESTED" }, _sum: { amountUsd: true }, _count: true }),
    db.session.findFirst({ where: { userId: id }, orderBy: { updatedAt: "desc" } }),
    db.session.count({ where: { userId: id, expiresAt: { gt: new Date() } } }),
  ]);
  const k = KYC[user.kycStatus];
  const anonymized = isAnonymized(user.email);
  const blocker = summary.total > 0.01 ? "le client a encore un solde, il doit d'abord tout retirer." : pendingDeposits + pendingWd._count > 0 ? "une opération est en attente." : null;

  return (
    <>
      <Link href="/admin/clients" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink">
        <IconChevronLeft size={18} stroke={1.75} /> Clients
      </Link>
      <AdminHead
        title={user.name}
        sub={`${user.email}${user.phone ? ` · ${user.phone}` : ""} · client depuis le ${formatDate(user.createdAt)} · réf. ${user.reference}`}
        actions={
          anonymized ? undefined : (
            <a href={`mailto:${user.email}`} className="inline-flex h-11 items-center rounded-md border border-line-strong bg-surface-raised px-5 text-[15px] font-semibold text-ink hover:bg-surface-sunken">
              Envoyer un e-mail
            </a>
          )
        }
      />
      {user.suspendedAt && (
        <p className="m-0 rounded-lg bg-down-soft p-4 font-semibold text-down">
          {anonymized ? `Compte supprimé le ${formatDateTime(user.suspendedAt)}. Seul l'historique financier est conservé.` : `Compte banni le ${formatDateTime(user.suspendedAt)}${user.suspendReason ? ` : ${user.suspendReason}` : ""}.`}
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi label="Solde" value={formatUSD(summary.total)} sub={`${summary.gain >= 0 ? "▲ +" : "▼ "}${formatUSD(summary.gain)} depuis le début`} tone={summary.gain >= 0 ? "up" : "down"} />
            <Kpi label="Net déposé" value={formatUSD(summary.netInvested)} sub={`${formatUSD(summary.deposited)} déposés au total`} />
            <Kpi label="En attente" value={String(pendingDeposits + pendingWd._count)} sub={`${pendingDeposits} dépôt(s), ${pendingWd._count} retrait(s)`} tone={pendingDeposits + pendingWd._count ? "warn" : undefined} />
          </div>
          <Panel title="Positions">
            <Table head={["Actif", "Quantité", "Cours", "Valeur", "Part"]} align={["left", "right", "right", "right", "right"]}>
              {summary.items.length === 0 && <EmptyRow cols={5} text="Aucune position." />}
              {summary.items.map((h) => (
                <tr key={h.symbol}>
                  <td className="font-semibold">{h.name}</td>
                  <td className="text-right tabular-nums">{formatQty(h.quantity, h.symbol)}</td>
                  <td className="text-right tabular-nums">{formatUSD(h.priceUsd)}</td>
                  <td className="text-right font-semibold tabular-nums">{formatUSD(h.valueUsd)}</td>
                  <td className="text-right tabular-nums">{h.share.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %</td>
                </tr>
              ))}
            </Table>
          </Panel>
          <Panel title="Opérations">
            <ActivityList items={toActivity(activity)} />
          </Panel>
        </div>
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-4">
          {!anonymized && user.id !== admin.id && <AccountManagement userId={user.id} email={user.email} role={user.role} banned={Boolean(user.suspendedAt)} deletable={blocker} />}
          {user.id === admin.id && <Panel title="Gestion du compte"><p className="m-0 text-sm text-ink-muted">C&apos;est votre compte : un autre administrateur doit faire ces actions.</p></Panel>}
          <Panel title="Identité">
            <div>
              <KV label="Statut" value={<Badge tone={k[1]}>{k[0]}</Badge>} />
              {kyc && (
                <>
                  <KV label="Date de naissance" value={new Date(kyc.birthDate).toLocaleDateString("fr-FR")} />
                  <KV label="Adresse" value={`${kyc.address}, ${kyc.postalCode} ${kyc.city}, ${kyc.country}`} />
                  {kyc.reviewedAt && <KV label={kyc.status === "APPROVED" ? "Validé le" : "Traité le"} value={`${formatDate(kyc.reviewedAt)}${kyc.reviewer ? ` par ${kyc.reviewer.firstName ?? kyc.reviewer.name}` : ""}`} />}
                  {kyc.rejectReason && <KV label="Motif du refus" value={kyc.rejectReason} />}
                </>
              )}
            </div>
            {kyc && (
              <Link href={`/admin/verifications?id=${kyc.id}&statut=${kyc.status === "PENDING" ? "attente" : kyc.status === "APPROVED" ? "validees" : "refusees"}`} className="text-sm font-semibold">
                Voir les documents
              </Link>
            )}
          </Panel>
          <Panel title="Profil d'investissement">
            {user.profile ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[17px] font-bold">{PROFILE_LABELS[user.profile]}</span>
                  <Badge tone="flash">Risque {PROFILE_RISK[user.profile]}/5</Badge>
                </div>
                {user.profileSetAt && <KV label="Choisi le" value={formatDate(user.profileSetAt)} />}
              </>
            ) : (
              <p className="m-0 text-ink-muted">Pas encore choisi.</p>
            )}
          </Panel>
          <Panel title="Comptes bancaires">
            {user.bankAccounts.length === 0 && <p className="m-0 text-ink-muted">Aucun compte enregistré.</p>}
            {user.bankAccounts.map((b) => (
              <div key={b.id}>
                <KV label="IBAN" value={b.iban} />
                <KV label="Titulaire" value={b.holder} />
                {b.bic && <KV label="BIC" value={b.bic} />}
              </div>
            ))}
          </Panel>
          <Panel title="Sécurité">
            <div>
              <KV label="Double vérification" value={<Badge tone="up">E-mail</Badge>} />
              <KV label="Dernière activité" value={lastSession ? formatDateTime(lastSession.updatedAt) : "Jamais"} />
              <KV label="Sessions ouvertes" value={sessions} />
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
