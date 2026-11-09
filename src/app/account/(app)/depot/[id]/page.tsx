import { notFound } from "next/navigation";
import { IconCheck, IconClock, IconX } from "@tabler/icons-react";
import { Alert, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { Coin } from "@/components/ui/decor";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/server/session";
import { getSettings } from "@/lib/server/settings";
import { db } from "@/lib/server/db";
import { cn, formatDateTime, formatMoney, formatUSD } from "@/lib/utils";

export const metadata = { title: "Suivi du dépôt" };

function Step({ state, title, sub }: { state: "done" | "current" | "todo" | "failed"; title: string; sub: string }) {
  return (
    <li className="relative flex gap-3.5 pb-6 last:pb-0">
      <span className="absolute top-8 bottom-1 left-[13px] w-0.5 bg-line [li:last-child>&]:hidden" aria-hidden="true" />
      {state === "done" && (
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-flash">
          <IconCheck size={16} stroke={3} />
        </span>
      )}
      {state === "current" && (
        <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-flash text-on-flash">
          <IconClock size={16} stroke={1.75} />
        </span>
      )}
      {state === "failed" && (
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-down-fill text-on-down">
          <IconX size={16} stroke={3} />
        </span>
      )}
      {state === "todo" && <span className="size-7 shrink-0 rounded-full border-2 border-line-strong bg-surface-raised" />}
      <div className={cn("flex flex-col", state === "todo" && "text-ink-muted")}>
        <span className="font-bold">{title}</span>
        <span className="text-sm text-ink-muted">{sub}</span>
      </div>
    </li>
  );
}

export default async function DepositTrackingPage({ params }: PageProps<"/account/depot/[id]">) {
  const user = await requireOnboardedUser();
  const { id } = await params;
  const d = await db.deposit.findFirst({ where: { id, userId: user.id } });
  if (!d) notFound();
  const settings = await getSettings();
  const credited = d.status === "CREDITED";
  const rejected = d.status === "REJECTED";
  const delay = d.method === "INSTANT" ? settings.money.depositDelayInstant : settings.money.depositDelayStandard;
  const declared = d.declaredAmount ? formatMoney(Number(d.declaredAmount), d.currency) : `Virement en ${d.currency}`;

  return (
    <>
      <TopBar title="Suivi du dépôt" back="/account" />
      <Page narrow>
        <PageHeading title="Suivi du dépôt" back="/account" />
        <div className="relative overflow-hidden rounded-lg bg-band p-5 text-on-band">
          <div className="absolute top-4 right-4">
            <Coin tone="yellow" size={56} tilt={50} spin={22} />
          </div>
          <span className="text-caption text-flash">{credited ? "COMPTE CRÉDITÉ" : rejected ? "DÉPÔT REFUSÉ" : "EN VÉRIFICATION"}</span>
          <p className="text-amount-xl m-0 mt-1.5 mb-1 pr-16">{credited && d.creditedUsd ? formatUSD(Number(d.creditedUsd)) : declared}</p>
          <span className="text-[13px] opacity-80">
            {d.method === "INSTANT" ? "Virement instantané" : "Virement classique"} · réf. {d.reference}
          </span>
        </div>

        {!credited && !rejected && (
          <Alert tone="info" title="Nous vérifions votre virement">
            Délai indicatif : {delay}. Vous pouvez fermer l&apos;app : vous serez prévenu par notification et par e-mail dès que votre solde est crédité.
          </Alert>
        )}
        {rejected && (
          <Alert tone="down" title="Dépôt refusé">
            {d.note ?? "Contactez le support pour en savoir plus."}
          </Alert>
        )}

        <ol className="m-0 mt-2 list-none p-0">
          <Step state="done" title="Dépôt déclaré" sub={`${declared} · ${formatDateTime(d.announcedAt)}`} />
          <Step
            state={rejected ? "failed" : credited ? "done" : "current"}
            title={rejected ? "Virement non accepté" : credited ? "Virement reçu par FlashInv" : "Vérification par FlashInv"}
            sub={
              rejected
                ? "Rien n'a été crédité."
                : credited && d.receivedAmount
                  ? `${formatMoney(Number(d.receivedAmount), d.currency)} reçus${d.receivedAt ? ` le ${formatDateTime(d.receivedAt)}` : ""}`
                  : `Sous ${delay}`
            }
          />
          <Step
            state={credited ? "done" : "todo"}
            title="Solde disponible crédité"
            sub={credited && d.creditedUsd ? `${formatUSD(Number(d.creditedUsd))}${d.currency === "EUR" && d.fxRate ? ` (1 € = ${Number(d.fxRate).toLocaleString("fr-FR", { maximumFractionDigits: 4 })} $)` : ""}` : "Vous pourrez ensuite investir"}
          />
        </ol>

        <div className="flex flex-col gap-2">
          {credited && (
            <ButtonLink href="/account/investir" size="lg" block>
              Investir maintenant
            </ButtonLink>
          )}
          {rejected && (
            <ButtonLink href="/account/depot" size="lg" block>
              Faire un nouveau dépôt
            </ButtonLink>
          )}
          <ButtonLink href="/account" variant="secondary" size="lg" block>
            Retour à l&apos;accueil
          </ButtonLink>
        </div>
      </Page>
    </>
  );
}
