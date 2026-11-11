import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { BottomNav, BottomNavView } from "@/components/account/nav";
import { SideNav } from "@/components/account/nav";
import { PageSkeleton, Skeleton } from "@/components/app/primitives";
import { requireUser } from "@/lib/server/session";
import { PROFILE_LABELS } from "@/lib/utils";
import { SupportChatLift } from "@/components/support-chat";
import { LiveRoot } from "@/components/live/live-root";
import { NotificationBell, NotificationsProvider, NotificationsRouteWatcher } from "@/components/account/notifications-live";

async function SidebarUser() {
  const user = await requireUser();
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "FI";
  return (
    <>
      <SideNav />
      <Link href="/account/reglages" className="mt-auto flex items-center gap-2.5 rounded-md bg-surface-sunken p-3 text-ink">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink font-bold text-flash">{initials}</span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-bold">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-caption text-ink-muted">{user.profile ? `Profil ${PROFILE_LABELS[user.profile].toLowerCase()}` : "Profil à choisir"}</span>
        </span>
      </Link>
    </>
  );
}

export default function AppLayout({ children }: LayoutProps<"/account">) {
  return (
    <NotificationsProvider>
    <SupportChatLift />
    <div className="flex min-h-dvh flex-1 flex-col lg:flex-row">
      <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col gap-7 border-r border-line bg-surface-raised px-4 py-6 lg:flex">
        <Link href="/account" aria-label="Accueil FlashInv" className="w-fit px-2">
          <Logo size={32} />
        </Link>
        <Suspense
          fallback={
            <div className="flex flex-col gap-2">
              {Array.from({ length: 7 }, (_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          }
        >
          <SidebarUser />
        </Suspense>
      </aside>
      <div className="min-w-0 flex-1 pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0">
        <div className="sticky top-0 z-10 hidden justify-end px-10 pt-4 lg:flex">
          <NotificationBell className="bg-surface-raised border border-line" />
        </div>
        <Suspense fallback={<PageSkeleton />}>
          <NotificationsRouteWatcher />
          <LiveRoot>{children}</LiveRoot>
        </Suspense>
      </div>
      <Suspense fallback={<BottomNavView pathname="" />}>
        <BottomNav />
      </Suspense>
    </div>
    </NotificationsProvider>
  );
}
