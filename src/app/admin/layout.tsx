import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileMenu } from "@/components/ui/profile-menu";
import { Logo } from "@/components/ui/logo";
import { Skeleton } from "@/components/app/primitives";
import { AdminNav } from "@/components/admin/nav";
import { requireAdmin } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { LiveRoot } from "@/components/live/live-root";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin FlashRend" },
  robots: { index: false, follow: false },
};

const adminName = (a: { firstName: string | null; lastName: string | null; email: string }) => `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() || a.email;

async function MobileMenu() {
  const admin = await requireAdmin();
  return <ProfileMenu variant="compact" name={adminName(admin)} email={admin.email} />;
}

async function NavWithCounts() {
  const admin = await requireAdmin();
  const [kyc, deposits, withdrawals, refunds] = await Promise.all([
    db.kycSubmission.count({ where: { status: "PENDING" } }),
    db.deposit.count({ where: { status: "ANNOUNCED" } }),
    db.withdrawal.count({ where: { status: "REQUESTED" } }),
    db.refundRequest.count({ where: { status: { in: ["REQUESTED", "ACCEPTED"] } } }),
  ]);
  return <AdminNav counts={{ kyc, deposits, withdrawals, refunds }} name={adminName(admin)} email={admin.email} />;
}

function ContentSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-lg" />
    </div>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 bg-band px-3.5 py-4 text-on-band lg:sticky lg:top-0 lg:h-dvh lg:w-[248px] lg:py-[22px]">
        <div className="flex items-center gap-2.5 px-1.5">
          <Logo tone="dark" size={28} />
          <span className="ml-auto rounded-xs bg-flash px-2 py-0.5 text-[11px] font-bold tracking-[.06em] text-on-flash lg:ml-auto">ADMIN</span>
          <div className="lg:hidden">
            <Suspense fallback={<Skeleton className="size-10 rounded-full bg-on-band/10" />}>
              <MobileMenu />
            </Suspense>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="hidden flex-col gap-1 lg:flex">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-10 bg-on-band/10" />
              ))}
            </div>
          }
        >
          <NavWithCounts />
        </Suspense>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6">
          <Suspense fallback={<ContentSkeleton />}>
            <LiveRoot>{children}</LiveRoot>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
