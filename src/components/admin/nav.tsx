"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconLayoutDashboard, IconUsers, IconId, IconArrowDownLeft, IconArrowUpRight, IconChartPie, IconBolt, IconSettings, IconHistory, IconBook, IconLogout, IconExternalLink } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", Icon: IconLayoutDashboard },
  { href: "/admin/clients", label: "Clients", Icon: IconUsers },
  { href: "/admin/verifications", label: "Vérifications", Icon: IconId, count: "kyc" },
  { href: "/admin/depots", label: "Dépôts", Icon: IconArrowDownLeft, count: "deposits" },
  { href: "/admin/retraits", label: "Retraits", Icon: IconArrowUpRight, count: "withdrawals" },
  { href: "/admin/profils", label: "Profils", Icon: IconChartPie },
  { href: "/admin/flash", label: "Flash 24 h", Icon: IconBolt },
  { href: "/admin/reglages", label: "Réglages", Icon: IconSettings },
  { href: "/admin/journal", label: "Journal", Icon: IconHistory },
  { href: "/admin/guide", label: "Guide", Icon: IconBook },
] as const;

export function AdminNav({ counts, name }: { counts: Record<"kyc" | "deposits" | "withdrawals", number>; name: string }) {
  const pathname = usePathname();
  const router = useRouter();
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
              className={cn("flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold whitespace-nowrap", active ? "bg-flash text-on-flash" : "text-on-band/85 hover:bg-on-band/10")}
            >
              <it.Icon size={20} stroke={1.75} />
              <span className="lg:flex-1">{it.label}</span>
              {count > 0 && <span className={cn("min-w-[22px] rounded-full px-[7px] py-px text-center text-xs font-bold", active ? "bg-ink text-flash" : "bg-flash text-on-flash")}>{count}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden flex-col gap-1 border-t border-on-band/15 pt-4 lg:flex">
        <span className="truncate px-3 text-xs text-on-band/70">Connecté : {name}</span>
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-on-band/85 hover:bg-on-band/10">
          <IconExternalLink size={18} stroke={1.75} /> Voir le site
        </Link>
        <button
          type="button"
          onClick={async () => {
            await authClient.signOut();
            router.replace("/account/connexion");
          }}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-on-band/85 hover:bg-on-band/10"
        >
          <IconLogout size={18} stroke={1.75} /> Se déconnecter
        </button>
      </div>
    </>
  );
}
