"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconBell } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Latest = { id: string; title: string; body: string; url: string | null } | null;
const Ctx = createContext<{ count: number | null; refresh: () => void }>({ count: null, refresh: () => {} });

/** Compteur de notifications non lues, rafraîchi toutes les 15 s, au retour sur l'onglet et à chaque changement de page. */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState<number | null>(null);
  const lastId = useRef<string | null | undefined>(undefined);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { count: number; latest: Latest };
      setCount(data.count);
      // Nouvelle notification arrivée pendant la visite : aperçu en toast.
      if (lastId.current !== undefined && data.latest && data.latest.id !== lastId.current) {
        const latest = data.latest;
        toast(latest.title, {
          description: latest.body,
          action: latest.url ? { label: "Voir", onClick: () => router.push(latest.url!) } : undefined,
        });
        router.refresh();
      }
      lastId.current = data.latest?.id ?? null;
    } catch {}
  }, [router]);

  useEffect(() => {
    // Premier appel après l'hydratation de la page, pour ne pas la perturber.
    const first = setTimeout(refresh, 2000);
    const timer = setInterval(() => document.visibilityState === "visible" && refresh(), 15_000);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return <Ctx.Provider value={{ count, refresh }}>{children}</Ctx.Provider>;
}

/** À placer sous un <Suspense> : rafraîchit le compteur à chaque changement de page. */
export function NotificationsRouteWatcher() {
  const pathname = usePathname();
  const { refresh } = useContext(Ctx);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [pathname, refresh]);
  return null;
}

export function useNotificationCount() {
  return useContext(Ctx);
}

export function NotificationBadge({ className }: { className?: string }) {
  const { count } = useContext(Ctx);
  if (!count) return null;
  return <span key={count} className={cn("fx-badge grid h-5 min-w-5 place-items-center rounded-full bg-down-fill px-1 text-[11px] leading-none font-bold text-on-down tabular-nums", className)}>{count > 9 ? "9+" : count}</span>;
}

/** Cloche en haut à droite, avec le nombre de notifications non lues. */
export function NotificationBell({ className }: { className?: string }) {
  const { count } = useContext(Ctx);
  return (
    <Link href="/account/notifications" aria-label={count ? `Notifications, ${count} non lue${count > 1 ? "s" : ""}` : "Notifications"} className={cn("relative grid size-11 place-items-center rounded-md text-ink hover:bg-ink/8", className)}>
      <IconBell size={22} stroke={1.75} />
      <NotificationBadge className="absolute top-1 right-0.5 ring-2 ring-surface" />
    </Link>
  );
}

/** Marque tout comme lu à l'ouverture de la page Notifications. */
export function MarkSeen({ action }: { action: () => Promise<void> }) {
  const { refresh } = useContext(Ctx);
  useEffect(() => {
    action().then(refresh);
  }, [action, refresh]);
  return null;
}
