import { notFound } from "next/navigation";
import { Alert, Card, InfoRow, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { AssetIcon } from "@/components/account/widgets";
import { AssetLiveChart } from "@/components/live/live-chart";
import { LiveAssetHolding, LivePriceRow } from "@/components/live/live-widgets";
import { Stripes } from "@/components/ui/decor";
import { requireOnboardedUser } from "@/lib/server/session";
import { getPriceHistory } from "@/lib/server/prices";
import { db } from "@/lib/server/db";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/account/portefeuille/[symbol]">) {
  const { symbol } = await params;
  return { title: symbol.toUpperCase() };
}

export default async function AssetPage({ params }: PageProps<"/account/portefeuille/[symbol]">) {
  const user = await requireOnboardedUser();
  const symbol = (await params).symbol.toUpperCase();
  const asset = await db.asset.findUnique({ where: { symbol } });
  if (!asset) notFound();
  const [position, history] = await Promise.all([db.position.findUnique({ where: { userId_symbol: { userId: user.id, symbol } } }), getPriceHistory(asset.coingeckoId, 90)]);

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
              <LiveAssetHolding position={{ symbol, name: asset.name, quantity: Number(position?.quantity ?? 0) }} />
            </div>
            <div>
              <LivePriceRow symbol={symbol} />
              {position && <InfoRow label="Dernier mouvement" value={formatDate(position.updatedAt)} />}
            </div>
          </div>
          <div className="flex flex-col gap-5 lg:col-span-7">
            <Card>
              <AssetLiveChart symbol={symbol} name={asset.name} fallback={history} />
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
