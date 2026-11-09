import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowDownLeft, IconArrowUpRight, IconArrowsExchange, IconBell, IconShieldCheck } from "@tabler/icons-react";
import { EmptyState, IconTile, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { PushOptIn } from "@/components/account/push";
import { MarkSeen } from "@/components/account/notifications-live";
import { requireUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { formatDateTime } from "@/lib/utils";
import { markAllRead } from "./actions";

export const metadata: Metadata = { title: "Notifications" };

const KIND = {
  deposit: { Icon: IconArrowDownLeft, tone: "info" as const },
  withdrawal: { Icon: IconArrowUpRight, tone: "sunken" as const },
  kyc: { Icon: IconShieldCheck, tone: "up" as const },
  rebalance: { Icon: IconArrowsExchange, tone: "soft" as const },
  info: { Icon: IconBell, tone: "sunken" as const },
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 60 });

  return (
    <>
      <TopBar title="Notifications" back="/account" bell={false} />
      <MarkSeen action={markAllRead} />
      <Page narrow>
        <PageHeading title="Notifications" />
        <PushOptIn vapidKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""} />
        {items.length === 0 ? (
          <EmptyState title="Aucune notification" text="Vous serez prévenu ici à chaque virement reçu, retrait envoyé ou ajustement de votre portefeuille." />
        ) : (
          <ul className="m-0 list-none p-0">
            {items.map((n) => {
              const k = KIND[n.kind as keyof typeof KIND] ?? KIND.info;
              const body = (
                <>
                  <IconTile tone={k.tone}>
                    <k.Icon size={20} stroke={1.75} />
                  </IconTile>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[15px] font-bold">{n.title}</span>
                    <span className="text-sm leading-5 text-ink-muted">{n.body}</span>
                    <span className="text-caption text-ink-muted">{formatDateTime(n.createdAt)}</span>
                  </div>
                  {n.readAt ? <span className="w-2 shrink-0" /> : <span aria-label="Non lue" className="mt-2 size-2 shrink-0 rounded-full bg-down-fill" />}
                </>
              );
              return (
                <li key={n.id} className="border-t border-line first:border-t-0">
                  {n.url ? (
                    <Link href={n.url} className="flex gap-3 py-3.5 text-ink">
                      {body}
                    </Link>
                  ) : (
                    <div className="flex gap-3 py-3.5">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Page>
    </>
  );
}
