import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function AdminHead({ title, sub, actions }: { title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-h1 m-0">{title}</h1>
        {sub && <p className="m-0 mt-1 text-ink-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Kpi({ label, value, sub, tone, href }: { label: string; value: string; sub?: string; tone?: "up" | "warn" | "down"; href?: string }) {
  const inner = (
    <>
      <span className="text-caption text-ink-muted">{label}</span>
      <span className="text-[26px] leading-8 font-bold tracking-tight tabular-nums">{value}</span>
      {sub && <span className={cn("text-[13px] font-semibold", tone === "up" ? "text-up" : tone === "warn" ? "text-warning" : tone === "down" ? "text-down" : "text-ink-muted")}>{sub}</span>}
    </>
  );
  const cls = "flex flex-col gap-1 rounded-lg border border-line bg-surface-raised p-[18px] text-ink";
  return href ? (
    <Link href={href} className={cn(cls, "hover:border-line-strong")}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function Panel({ title, right, children, className }: { title?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex min-w-0 flex-col gap-3.5 rounded-lg border border-line bg-surface-raised p-5", className)}>
      {(title || right) && (
        <div className="flex items-center justify-between gap-3">
          {title && <h2 className="text-h3 m-0">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Person({ name, email, size = 36 }: { name: string; email?: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="grid shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-flash" style={{ width: size, height: size }}>
        {initials}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{name}</span>
        {email && <span className="truncate text-xs text-ink-muted">{email}</span>}
      </span>
    </span>
  );
}

export function Table({ head, children, align }: { head: string[]; children: React.ReactNode; align?: ("left" | "right")[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface-raised">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface-sunken">
            {head.map((h, i) => (
              <th key={i} scope="col" className={cn("px-4 py-2.5 text-xs font-bold tracking-wide text-ink-muted uppercase", align?.[i] === "right" ? "text-right" : "text-left")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-t [&>tr]:border-line [&_td]:px-4 [&_td]:py-3">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-10! text-center text-ink-muted">
        {text}
      </td>
    </tr>
  );
}

export function LinkTabs({ items, value, base, param = "statut", extra }: { items: { key: string; label: string; count?: number }[]; value: string; base: string; param?: string; extra?: Record<string, string> }) {
  return (
    <nav aria-label="Filtrer" className="flex w-fit max-w-full overflow-x-auto rounded-md bg-surface-sunken p-0.5">
      {items.map((t, i) => {
        const qs = new URLSearchParams({ ...(extra ?? {}), ...(i === 0 ? {} : { [param]: t.key }) }).toString();
        return (
          <Link
            key={t.key}
            href={`${base}${qs ? `?${qs}` : ""}`}
            aria-current={t.key === value ? "page" : undefined}
            className={cn("flex h-9 items-center gap-1.5 rounded-sm px-3.5 text-sm font-semibold whitespace-nowrap", t.key === value ? "bg-surface-raised text-ink" : "text-ink-muted hover:text-ink")}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && <span className="rounded-full bg-flash px-1.5 text-xs leading-5 text-on-flash">{t.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function SearchBox({ placeholder, value, hidden }: { placeholder: string; value?: string; hidden?: Record<string, string | undefined> }) {
  return (
    <form role="search" className="relative w-80 max-w-full">
      {Object.entries(hidden ?? {}).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <IconSearch size={18} stroke={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted" />
      <input
        name="q"
        type="search"
        defaultValue={value}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-md border border-line-strong bg-surface-raised pr-3 pl-9 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/15"
      />
    </form>
  );
}

export function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-t border-line py-2.5 text-sm first:border-t-0">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-semibold [overflow-wrap:anywhere] tabular-nums">{value}</span>
    </div>
  );
}

export function relDays(d: Date) {
  const h = Math.round((Date.now() - d.getTime()) / 3600000);
  if (h < 1) return "il y a moins d'une heure";
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  return `il y a ${j} j`;
}
