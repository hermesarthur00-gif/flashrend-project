import type { Metadata } from "next";
import { IconBolt } from "@tabler/icons-react";
import { Card, EmptyState, Page, PageHeading, SectionTitle, TopBar } from "@/components/app/primitives";
import { ButtonLink } from "@/components/ui/button";
import { LiveFlashCard } from "@/components/live/flash-chart";
import { requireOnboardedUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { formatDateTime, formatEUR } from "@/lib/utils";
import { FlashForm } from "./flash-form";

export const metadata: Metadata = { title: "Flash 24 h" };

export default async function FlashPage() {
  const user = await requireOnboardedUser();
  const cash = Number(user.cashEur);
  const [offers, running, past] = await Promise.all([
    db.flashOffer.findMany({ where: { active: true }, orderBy: { ratePercent: "asc" } }),
    db.flashInvestment.findMany({ where: { userId: user.id, status: "RUNNING" }, orderBy: { endsAt: "asc" } }),
    db.flashInvestment.findMany({ where: { userId: user.id, status: "MATURED" }, orderBy: { settledAt: "desc" }, take: 10 }),
  ]);

  let form: React.ReactNode;
  if (user.kycStatus !== "APPROVED") form = <EmptyState glyph="eth" title="Identité en cours de vérification" text="Vous pourrez lancer un Flash 24 h dès que votre identité sera validée." action={<ButtonLink href="/account" variant="secondary">Retour à l&apos;accueil</ButtonLink>} />;
  else if (offers.length === 0) form = <EmptyState title="Aucune offre Flash pour le moment" text="De nouvelles offres seront proposées ici. Vous serez prévenu par notification." />;
  else if (cash < 0.01) form = <EmptyState title="Aucun solde disponible" text="Faites d'abord un dépôt. Une fois crédité, vous pourrez lancer un Flash 24 h." action={<ButtonLink href="/account/depot">Faire un dépôt</ButtonLink>} />;
  else form = <FlashForm cash={cash} offers={offers.map((o) => ({ id: o.id, name: o.name, ratePercent: Number(o.ratePercent), min: Number(o.minEur), max: o.maxEur === null ? null : Number(o.maxEur) }))} />;

  return (
    <>
      <TopBar title="Flash 24 h" back="/account" />
      <Page narrow>
        <PageHeading title="Flash 24 h" sub="Bloquez un montant 24 h au rendement annoncé." back="/account" />
        {running.map((f) => (
          <LiveFlashCard key={f.id} f={{ id: f.id, offerName: f.offerName, ratePercent: Number(f.ratePercent), amount: Number(f.amountEur), gain: Number(f.gainEur), startsAt: f.startsAt.getTime(), endsAt: f.endsAt.getTime() }} />
        ))}
        {running.length > 0 && <SectionTitle title="Lancer un nouveau Flash" />}
        {form}
        {past.length > 0 && (
          <section className="flex flex-col gap-1">
            <SectionTitle title="Flash terminés" />
            <Card className="p-0">
              {past.map((f) => (
                <div key={f.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-surface-sunken">
                    <IconBolt size={18} stroke={1.75} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] leading-5 font-semibold">{f.offerName}</span>
                    <span className="block text-xs leading-4 text-ink-muted">Terminé le {formatDateTime(f.settledAt ?? f.endsAt)}</span>
                  </span>
                  <span className="flex flex-col items-end">
                    <span className="text-amount-sm text-[15px] tabular-nums">{formatEUR(Number(f.amountEur))}</span>
                    <span className="text-xs font-semibold text-up tabular-nums">+{formatEUR(Number(f.gainEur))}</span>
                  </span>
                </div>
              ))}
            </Card>
          </section>
        )}
      </Page>
    </>
  );
}
