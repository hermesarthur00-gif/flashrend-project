"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { IconLayoutDashboard, IconUsers, IconId, IconArrowDownLeft, IconArrowUpRight, IconArrowBackUp, IconChartPie, IconBolt, IconMail, IconSettings, IconHistory, IconBook, IconChevronDown } from "@tabler/icons-react";
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
  { href: "/admin/guide", label: "Guide", Icon: IconBook, IconChevronDown },
] as const;

type Counts = Record<"kyc" | "deposits" | "withdrawals" | "refunds", number>;
const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

function NavLink({ it, active, count, onClick }: { it: (typeof ITEMS)[number]; active: boolean; count: number; onClick?: () => void }) {
  return (
    <Link
      href={it.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-[background-color,transform] duration-300 ease-[var(--ease-out)] active:scale-[.98]", active ? "bg-flash text-on-flash" : "text-on-band/85 hover:translate-x-0.5 hover:bg-on-band/10")}
    >
      <it.Icon size={20} stroke={1.75} />
      <span className="flex-1">{it.label}</span>
      {count > 0 && <span key={count} className={cn("fx-badge min-w-[22px] rounded-full px-[7px] py-px text-center text-xs font-bold", active ? "bg-ink text-flash" : "bg-flash text-on-flash")}>{count}</span>}
    </Link>
  );
}

const countOf = (it: (typeof ITEMS)[number], counts: Counts) => ("count" in it ? counts[it.count] : 0);

/** Mobile : menu déroulant qui montre la page courante et se déplie en liste (pas de barre à faire défiler). */
function MobileNav({ counts }: { counts: Counts }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = ITEMS.find((it) => isActive(pathname, it.href) && (it.href !== "/admin" || pathname === "/admin")) ?? ITEMS[0];
  const total = ITEMS.reduce((n, it) => n + countOf(it, counts), 0);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative lg:hidden">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center gap-3 rounded-md border border-on-band/15 bg-on-band/5 px-3 text-left text-sm font-semibold transition-[background-color,transform] duration-200 active:scale-[.99]"
      >
        <current.Icon size={20} stroke={1.75} className="text-flash" />
        <span className="flex-1">{current.label}</span>
        {total > 0 && !open && <span key={total} className="fx-badge min-w-[22px] rounded-full bg-flash px-[7px] py-px text-center text-xs font-bold text-on-flash">{total}</span>}
        <IconChevronDown size={20} stroke={1.75} className={cn("text-on-band/70 transition-transform duration-300", open && "rotate-180")} />
      </button>
      {open && (
        <nav aria-label="Navigation admin" className="menu-pop absolute inset-x-0 top-full z-40 mt-2 flex max-h-[70dvh] origin-top flex-col gap-0.5 overflow-y-auto rounded-lg border border-on-band/15 bg-band p-1.5 shadow-overlay">
          {ITEMS.map((it) => (
            <NavLink key={it.href} it={it} active={it.href === current.href} count={countOf(it, counts)} onClick={() => setOpen(false)} />
          ))}
        </nav>
      )}
    </div>
  );
}

export function AdminNav({ counts, name, email }: { counts: Counts; name: string; email: string }) {
  const pathname = usePathname();
  return (
    <>
      <MobileNav counts={counts} />
      <nav aria-label="Navigation admin" className="hidden flex-col gap-0.5 lg:flex">
        {ITEMS.map((it) => (
          <NavLink key={it.href} it={it} active={isActive(pathname, it.href)} count={countOf(it, counts)} />
        ))}
      </nav>
      <div className="mt-auto hidden lg:block">
        <ProfileMenu name={name} email={email} />
      </div>
    </>
  );
}
