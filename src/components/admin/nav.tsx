"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLayoutDashboard, IconUsers, IconId, IconArrowDownLeft, IconArrowUpRight, IconArrowBackUp, IconChartPie, IconBolt, IconMail, IconSettings, IconHistory, IconBook } from "@tabler/icons-react";
import { ProfileMenu } from "@/components/ui/profile-menu";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", Icon: IconLayoutDashboard },
  { href: "/admin/clients", label: "Clients", Icon: IconUsers },
  { href: "/admin/verifications", label: "Vérifications", Icon: IconId, count: "kyc" },
  { href: "/admin/depots", label: "Dépôts", Icon: IconArrowDownLeft, count: "deposits" },
  { href: "/admin/retraits", label: "Retraits", Icon: IconArrowUpRight, count: "withdrawals" },
  { href: "/admin/remboursements", label: "Remboursements", Icon: IconArrowBackUp, count: "refunds" },
  { href: "/admin/profils", label: "Profils", Icon: IconChartPie },
  { href: "/admin/flash", label: "Flash 24 h", Icon: IconBolt },
  { href: "/admin/emails", label: "E-mails", Icon: IconMail },
  { href: "/admin/reglages", label: "Réglages", Icon: IconSettings },
  { href: "/admin/journal", label: "Journal", Icon: IconHistory },
  { href: "/admin/guide", label: "Guide", Icon: IconBook },
] as const;

export function AdminNav({ counts, name, email }: { counts: Record<"kyc" | "deposits" | "withdrawals" | "refunds", number>; name: string; email: string }) {
  const pathname = usePathname();
  return (
    <>
      <nav aria-label="Navigation admin" className="-mx-3.5 flex gap-0.5 overflow-x-auto px-3.5 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {ITEMS.map((it) => {
          const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
          const count = "count" in it ? counts[it.count] : 0;
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={cn("flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-[background-color,transform] duration-300 ease-[var(--ease-out)] active:scale-[.98]", active ? "bg-flash text-on-flash" : "text-on-band/85 hover:translate-x-0.5 hover:bg-on-band/10")}
            >
              <it.Icon size={20} stroke={1.75} />
              <span className="lg:flex-1">{it.label}</span>
              {count > 0 && <span key={count} className={cn("fx-badge min-w-[22px] rounded-full px-[7px] py-px text-center text-xs font-bold", active ? "bg-ink text-flash" : "bg-flash text-on-flash")}>{count}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden lg:block">
        <ProfileMenu name={name} email={email} />
      </div>
    </>
  );
}
