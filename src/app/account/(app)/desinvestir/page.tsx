import type { Metadata } from "next";
import { EmptyState, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { DivestForm } from "./divest-form";

export const metadata: Metadata = { title: "Désinvestir" };

export default async function DivestPage() {
  const user = await requireOnboardedUser();
  const [positions, assets] = await Promise.all([db.position.findMany({ where: { userId: user.id, quantity: { gt: 0 } } }), db.asset.findMany({ select: { symbol: true, name: true } })]);
  const names = Object.fromEntries(assets.map((a) => [a.symbol, a.name]));

  return (
    <>
      <TopBar title="Désinvestir" back="/account/portefeuille" />
      <Page narrow>
        <PageHeading title="Désinvestir" back="/account/portefeuille" />
        {positions.length === 0 ? (
          <EmptyState title="Rien d'investi" text="Vous n'avez pas d'investissement en cours." action={<ButtonLink href="/account/investir">Investir</ButtonLink>} />
        ) : (
          <DivestForm cash={Number(user.cashUsd)} positions={positions.map((p) => ({ symbol: p.symbol, name: names[p.symbol] ?? p.symbol, quantity: Number(p.quantity) }))} />
        )}
      </Page>
    </>
  );
}
