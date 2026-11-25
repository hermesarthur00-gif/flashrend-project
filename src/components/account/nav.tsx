"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconChartLine, IconPlus, IconBolt, IconClock, IconUser, IconArrowUpRight, IconBell } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { NotificationBadge } from "./notifications-live";

const MOBILE = [
  { href: "/account", label: "Accueil", Icon: IconHome },
  { href: "/account/portefeuille", label: "Portefeuille", Icon: IconChartLine },
  { href: "/account/depot", label: "Déposer", Icon: IconPlus, primary: true },
  { href: "/account/activite", label: "Activité", Icon: IconClock },
  { href: "/account/reglages", label: "Profil", Icon: IconUser },
];

const DESKTOP = [
  { href: "/account", label: "Accueil", Icon: IconHome },
  { href: "/account/portefeuille", label: "Portefeuille", Icon: IconChartLine },
  { href: "/account/depot", label: "Déposer", Icon: IconPlus },
  { href: "/account/flash", label: "Flash 24 h", Icon: IconBolt },
  { href: "/account/retrait", label: "Retirer", Icon: IconArrowUpRight },
  { href: "/account/activite", label: "Activité", Icon: IconClock },
  { href: "/account/notifications", label: "Notifications", Icon: IconBell },
  { href: "/account/reglages", label: "Profil", Icon: IconUser },
];

function isActive(pathname: string, href: string) {
  return href === "/account" ? pathname === "/account" : pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  return <BottomNavView pathname={usePathname()} />;
}

/** Version sans page active, affichée tant que l'URL n'est pas connue (rendu statique). */
export function BottomNavView({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-raised pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto flex h-16 max-w-[560px] items-stretch px-1">
        {MOBILE.map(({ href, label, Icon, primary }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex flex-1">
              <Link href={href} aria-current={active ? "page" : undefined} className={cn("group flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] leading-4 font-semibold transition-colors duration-300", active ? "text-ink" : "text-ink-muted")}>
                {primary ? (
                  <span className="grid size-10 place-items-center rounded-md bg-flash text-on-flash transition-transform duration-300 group-active:scale-90">
                    <Icon size={22} stroke={2} />
                  </span>
                ) : (
                  <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-[background-color,transform] duration-300 group-active:scale-90", active && "bg-flash-soft")}>
                    <Icon size={22} stroke={1.75} />
                  </span>
                )}
                {!primary && label}
                {primary && <span className="sr-only">{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation de l'app" className="flex flex-col gap-1">
      {DESKTOP.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-semibold text-ink transition-[background-color,transform] duration-300 ease-[var(--ease-out)] active:scale-[.98]", active ? "bg-flash-soft" : "hover:translate-x-0.5 hover:bg-surface-sunken")}
          >
            <Icon size={20} stroke={1.75} />
            <span className="flex-1">{label}</span>
            {href.endsWith("notifications") && <NotificationBadge />}
          </Link>
        );
      })}
    </nav>
  );
}
