import { Alert, Badge } from "@/components/app/primitives";
import { AdminHead, EmptyRow, Kpi, Panel, Person, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/session";
import { settleDueFlash } from "@/lib/server/flash";
import { db } from "@/lib/server/db";
import { formatDateTime, formatEUR } from "@/lib/utils";
import { OfferActions, OfferForm, type OfferRow } from "./offer-form";
import { SettleButton } from "./settle-button";

export const metadata = { title: "Flash 24 h" };

export default async function AdminFlashPage() {
  await requireAdmin();
  await settleDueFlash();
  const [offers, running, past] = await Promise.all([
    db.flashOffer.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { investments: true } } } }),
    db.flashInvestment.findMany({ where: { status: "RUNNING" }, orderBy: { endsAt: "asc" }, include: { user: { select: { name: true, email: true } } } }),
    db.flashInvestment.findMany({ where: { status: "MATURED" }, orderBy: { settledAt: "desc" }, take: 20, include: { user: { select: { name: true, email: true } } } }),
  ]);
  const rows: OfferRow[] = offers.map((o) => ({ id: o.id, name: o.name, rate: Number(o.ratePercent), min: Number(o.minEur), max: o.maxEur === null ? null : Number(o.maxEur), active: o.active, subs: o._count.investments }));
  const blocked = running.reduce((s, f) => s + Number(f.amountEur), 0);
  const toPay = running.reduce((s, f) => s + Number(f.amountEur) + Number(f.gainEur), 0);
  const gains = running.reduce((s, f) => s + Number(f.gainEur), 0);

  return (
    <>
      <AdminHead title="Flash 24 h" sub="Offres à rendement fixé à l'avance. Le client bloque un montant 24 h, puis le récupère avec le rendement." actions={<SettleButton />} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="En cours" value={String(running.length)} sub={running.length ? `Prochaine échéance : ${formatDateTime(running[0].endsAt)}` : "Aucun Flash en cours"} />
        <Kpi label="Montants bloqués" value={formatEUR(blocked)} sub="Argent des clients" />
        <Kpi label="À verser à l'échéance" value={formatEUR(toPay)} sub={`dont ${formatEUR(gains)} de rendement`} tone={gains ? "warn" : undefined} />
        <Kpi label="Offres ouvertes" value={String(rows.filter((r) => r.active).length)} sub={`${rows.length} au total`} />
      </div>
      <Alert tone="warning" title="Le rendement est une promesse faite au client">
        À l&apos;échéance, le client reçoit automatiquement son capital et le rendement affiché, sur son solde disponible. Prévoyez les fonds pour couvrir les rendements. Modifier une offre ne change pas les Flash déjà lancés.
      </Alert>
      <Panel title="Nouvelle offre">
        <OfferForm />
      </Panel>
      <Panel title="Offres">
        {rows.length === 0 && <p className="m-0 text-ink-muted">Aucune offre pour l&apos;instant. Créez-en une ci-dessus : elle apparaît tout de suite chez les clients.</p>}
        {rows.map((o) => (
          <div key={o.id} className="flex flex-col gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <strong>{o.name}</strong>
              <Badge tone={o.active ? "up" : "neutral"}>{o.active ? "Ouverte" : "Fermée"}</Badge>
              <span className="text-sm text-ink-muted">
                {o.subs} souscription{o.subs > 1 ? "s" : ""}
              </span>
            </div>
            <OfferForm offer={o} />
            <OfferActions offer={o} />
          </div>
        ))}
      </Panel>
      <Panel title="Flash en cours">
        <Table head={["Client", "Offre", "Montant", "Rendement", "Échéance"]} align={["left", "left", "left", "left", "left"]}>
          {running.length === 0 && <EmptyRow cols={5} text="Aucun Flash en cours." />}
          {running.map((f) => (
            <tr key={f.id}>
              <td><Person name={f.user.name} email={f.user.email} /></td>
              <td>{f.offerName} · {Number(f.ratePercent).toLocaleString("fr-FR")} %</td>
              <td className="font-bold">{formatEUR(Number(f.amountEur))}</td>
              <td className="text-up">+{formatEUR(Number(f.gainEur))}</td>
              <td className="whitespace-nowrap">{formatDateTime(f.endsAt)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
      <Panel title="Derniers Flash terminés">
        <Table head={["Client", "Offre", "Montant", "Rendement versé", "Terminé le"]} align={["left", "left", "left", "left", "left"]}>
          {past.length === 0 && <EmptyRow cols={5} text="Aucun Flash terminé." />}
          {past.map((f) => (
            <tr key={f.id}>
              <td><Person name={f.user.name} email={f.user.email} /></td>
              <td>{f.offerName} · {Number(f.ratePercent).toLocaleString("fr-FR")} %</td>
              <td className="font-bold">{formatEUR(Number(f.amountEur))}</td>
              <td className="text-up">+{formatEUR(Number(f.gainEur))}</td>
              <td className="whitespace-nowrap">{formatDateTime(f.settledAt ?? f.endsAt)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
