import { notFound } from "next/navigation";
import { Alert, Card, InfoRow, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { AssetIcon } from "@/components/account/widgets";
import { ValueChart } from "@/components/account/value-chart";
import { Stripes } from "@/components/ui/decor";
import { PriceChange } from "@/components/ui/finance";
import { requireOnboardedUser } from "@/lib/server/session";
import { getHoldings } from "@/lib/server/portfolio";
import { getPriceHistory } from "@/lib/server/prices";
import { db } from "@/lib/server/db";
import { formatDate, formatQty, formatUSD } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/account/portefeuille/[symbol]">) {
  const { symbol } = await params;
  return { title: symbol.toUpperCase() };
}

export default async function AssetPage({ params }: PageProps<"/account/portefeuille/[symbol]">) {
  const user = await requireOnboardedUser();
  const symbol = (await params).symbol.toUpperCase();
  const asset = await db.asset.findUnique({ where: { symbol } });
  if (!asset) notFound();
  const [{ items }, history, first] = await Promise.all([
    getHoldings(user.id),
    getPriceHistory(asset.coingeckoId),
    db.position.findUnique({ where: { userId_symbol: { userId: user.id, symbol } }, select: { updatedAt: true } }),
  ]);
  const h = items.find((i) => i.symbol === symbol);
  const price = h?.priceUsd ?? Number(asset.priceUsd);

  return (
    <>
      <TopBar title={asset.name} back="/account/portefeuille" />
      <Page>
        <PageHeading title={asset.name} back="/account/portefeuille" />
        <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-5 lg:col-span-5">
            <div className="relative flex items-center gap-3.5 overflow-hidden rounded-lg bg-band p-5 text-on-band">
              <div className="pointer-events-none absolute -right-2 -bottom-2.5">
                <Stripes count={4} height={72} />
              </div>
              <AssetIcon symbol={symbol} size={48} />
              <div className="relative flex flex-col gap-0.5">
                <span className="text-caption text-flash">VOUS DÉTENEZ</span>
                <span className="text-amount-lg">{formatUSD(h?.valueUsd ?? 0)}</span>
                <span className="text-[13px] tabular-nums opacity-80">
                  {formatQty(h?.quantity ?? 0, symbol)} · {Math.round(h?.share ?? 0)} % du portefeuille
                </span>
              </div>
            </div>
            <div>
              <InfoRow label="Cours actuel" value={formatUSD(price)} />
              <InfoRow label="Variation 24 h" value={<PriceChange value={Number(asset.change24h)} />} />
              {asset.priceAt && <InfoRow label="Mis à jour" value={new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).format(asset.priceAt)} />}
              {first && <InfoRow label="Dernier mouvement" value={formatDate(first.updatedAt)} />}
            </div>
          </div>
          <div className="flex flex-col gap-5 lg:col-span-7">
            <Card>
              <h2 className="text-h3 m-0 mb-3">Cours de {asset.name}</h2>
              <ValueChart series={history} label={`Cours de ${asset.name}`} />
            </Card>
            <Alert tone="flash" title="Géré par FlashInv">
              Vous ne choisissez pas les cryptos une par une : leur part évolue avec votre profil.
            </Alert>
          </div>
        </div>
      </Page>
    </>
  );
}
