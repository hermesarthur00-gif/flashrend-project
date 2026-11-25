"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconChevronUp, IconExternalLink, IconLogout, IconUserCircle } from "@tabler/icons-react";
import { SignOutDialog } from "@/components/ui/sign-out";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  email: string;
  /** sidebar : bloc large, menu vers le haut. compact : avatar seul, menu vers le bas à droite. */
  variant?: "sidebar" | "compact";
};

const ITEM = "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-sunken focus-visible:bg-surface-sunken";

/** Menu du compte administrateur : compte client, site public, déconnexion confirmée. */
export function ProfileMenu({ name, email, variant = "sidebar" }: Props) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "FR";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        root.current?.querySelector<HTMLElement>("[data-trigger]")?.focus();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const items = [...(root.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
        const i = items.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    root.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const compact = variant === "compact";
  return (
    <div ref={root} className={cn("relative", !compact && "mt-auto")}>
      <button
        type="button"
        data-trigger
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={compact ? "Menu du compte" : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2.5 text-left transition-[background-color,transform] duration-200 active:scale-[.98]",
          compact ? "rounded-full" : "w-full rounded-md border border-on-band/15 p-2.5 hover:bg-on-band/10",
        )}
      >
        <span className={cn("grid shrink-0 place-items-center rounded-full bg-flash font-bold text-on-flash", compact ? "size-10" : "size-9")}>{initials}</span>
        {!compact && (
          <>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-bold text-on-band">{name}</span>
              <span className="truncate text-xs text-on-band/70">{email}</span>
            </span>
            <IconChevronUp size={18} stroke={1.75} className={cn("shrink-0 text-on-band/70 transition-transform duration-300", open ? "rotate-0" : "rotate-180")} />
          </>
        )}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Compte"
          className={cn(
            "menu-pop absolute z-50 w-[248px] rounded-lg border border-line bg-surface-raised p-1.5 text-ink shadow-overlay",
            compact ? "top-full right-0 mt-2 origin-top-right" : "bottom-full left-0 mb-2 origin-bottom-left",
          )}
        >
          <div className="px-3 pt-2 pb-2.5">
            <p className="m-0 truncate text-sm font-bold">{name}</p>
            <p className="m-0 truncate text-xs text-ink-muted">{email}</p>
          </div>
          <div className="my-1 border-t border-line" />
          <Link href="/account" role="menuitem" className={ITEM} onClick={() => setOpen(false)}>
            <IconUserCircle size={20} stroke={1.75} /> Mon compte client
          </Link>
          <Link href="/" target="_blank" role="menuitem" className={ITEM} onClick={() => setOpen(false)}>
            <IconExternalLink size={20} stroke={1.75} /> Voir le site
          </Link>
          <div className="my-1 border-t border-line" />
          <button
            type="button"
            role="menuitem"
            className={cn(ITEM, "text-down")}
            onClick={() => {
              setOpen(false);
              setConfirm(true);
            }}
          >
            <IconLogout size={20} stroke={1.75} /> Se déconnecter
          </button>
        </div>
      )}
      <SignOutDialog open={confirm} onClose={() => setConfirm(false)} name={name} />
    </div>
  );
}
