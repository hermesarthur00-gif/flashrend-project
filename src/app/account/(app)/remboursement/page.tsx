import type { Metadata } from "next";
import { Alert, Badge, Card, EmptyState, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { REFUND_REASONS, REFUND_STATUS } from "@/lib/refund";
import { formatDateTime, formatEUR } from "@/lib/utils";
import { RefundForm } from "./refund-form";

export const metadata: Metadata = { title: "Remboursement" };

export default async function RefundPage({ searchParams }: PageProps<"/account/remboursement">) {
  const user = await requireOnboardedUser();
  const sp = await searchParams;
  const [deposits, requests] = await Promise.all([
    db.deposit.findMany({ where: { userId: user.id, status: "CREDITED", creditedEur: { not: null }, refunds: { none: { status: { in: ["REQUESTED", "ACCEPTED", "REFUNDED"] } } } }, orderBy: { createdAt: "desc" } }),
    db.refundRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);
  const cash = Number(user.cashEur);
  const options = deposits.filter((d) => Number(d.creditedEur) <= cash + 0.005).map((d) => ({ id: d.id, label: `${formatEUR(Number(d.creditedEur))} · ${formatDateTime(d.receivedAt ?? d.createdAt)}` }));
  const blocked = deposits.length - options.length;

  return (
    <>
      <TopBar title="Remboursement" back="/account/reglages" />
      <Page narrow>
        <PageHeading title="Remboursement" sub="Pour un dépôt crédité par erreur ou en double, tant qu'il n'est pas investi." />
        {options.length > 0 ? (
          <Card className="p-5">
            <RefundForm deposits={options} initial={typeof sp.depot === "string" ? sp.depot : undefined} />
            <p className="m-0 mt-3 text-sm text-ink-muted">Le montant est mis de côté dès l&apos;envoi de la demande. S&apos;il est refusé, il revient sur votre solde disponible.</p>
          </Card>
        ) : (
          <EmptyState
            title="Aucun dépôt remboursable"
            text={blocked ? "Le montant de vos dépôts n'est plus entièrement disponible. Désinvestissez d'abord la somme concernée." : "Seul un dépôt crédité dont le montant est encore disponible peut être remboursé."}
            action={blocked ? <ButtonLink href="/account/desinvestir">Désinvestir</ButtonLink> : <ButtonLink href="/account" variant="secondary">Retour à l&apos;accueil</ButtonLink>}
          />
        )}
        {requests.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-h3 m-0">Mes demandes</h2>
            {requests.map((r) => {
              const s = REFUND_STATUS[r.status];
              return (
                <Card key={r.id} className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">{formatEUR(Number(r.amountEur))}</span>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </div>
                  <span className="text-sm text-ink-muted">
                    {r.reference} · {REFUND_REASONS[r.reason]} · {formatDateTime(r.createdAt)}
                  </span>
                  {r.status === "ACCEPTED" && <Alert tone="info" title="Demande acceptée">Le virement vers votre compte d&apos;origine est en préparation.</Alert>}
                  {r.status === "REFUNDED" && <Alert tone="up" title="Remboursement envoyé">{r.adminNote ?? "Le virement est parti vers votre compte d'origine."}</Alert>}
                  {r.status === "REJECTED" && <Alert tone="down" title="Demande refusée">{r.adminNote ?? "Le montant a été rendu à votre solde disponible."}</Alert>}
                </Card>
              );
            })}
          </section>
        )}
      </Page>
    </>
  );
}
