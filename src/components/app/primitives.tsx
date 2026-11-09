import Link from "next/link";
import Image from "next/image";
import { IconChevronLeft, IconAlertTriangle, IconInfoCircle, IconCircleCheck, IconBolt, IconCircleX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Stripes } from "@/components/ui/decor";
import { NotificationBell } from "@/components/account/notifications-live";

export function TopBar({ title, back, right, className, bell = true }: { title?: string; back?: string; right?: React.ReactNode; className?: string; bell?: boolean }) {
  return (
    <header className={cn("flex h-14 shrink-0 items-center gap-2 px-2 lg:hidden", className)}>
      {back ? (
        <Link href={back} aria-label="Retour" className="grid size-11 place-items-center rounded-md text-ink hover:bg-ink/8">
          <IconChevronLeft size={22} stroke={1.75} />
        </Link>
      ) : (
        <span className="w-11" />
      )}
      <h1 className="m-0 flex-1 text-center text-[17px] leading-6 font-bold">{title}</h1>
      <span className="flex min-w-11 justify-end whitespace-nowrap">{right ?? (bell ? <NotificationBell /> : null)}</span>
    </header>
  );
}

/** En-tête de page sur grand écran (la TopBar mobile est masquée). */
export function PageHeading({ title, sub, back, actions }: { title: string; sub?: React.ReactNode; back?: string; actions?: React.ReactNode }) {
  return (
    <div className="hidden items-end justify-between gap-4 lg:flex">
      <div>
        {back && (
          <Link href={back} className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-ink">
            <IconChevronLeft size={16} stroke={2} /> Retour
          </Link>
        )}
        <h1 className="text-h1 m-0">{title}</h1>
        {sub && <p className="m-0 mt-1 text-ink-muted">{sub}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Page({ children, className, narrow = false }: { children: React.ReactNode; className?: string; narrow?: boolean }) {
  return (
    <div className={cn("mx-auto flex w-full flex-col gap-5 px-4 pt-2 pb-8 lg:gap-6 lg:px-10 lg:pt-8", narrow ? "max-w-[560px]" : "max-w-[1080px]", className)}>{children}</div>
  );
}

export function Card({ children, className, as: As = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "section" | "article" }) {
  return <As className={cn("rounded-lg border border-line bg-surface-raised p-4 lg:p-6", className)}>{children}</As>;
}

export function SectionTitle({ title, link, href }: { title: string; link?: string; href?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-h3 m-0">{title}</h2>
      {link && href && (
        <Link href={href} className="text-sm font-semibold text-ink underline-offset-2 hover:underline">
          {link}
        </Link>
      )}
    </div>
  );
}

export function InfoRow({ label, value, strong, className }: { label: React.ReactNode; value: React.ReactNode; strong?: boolean; className?: string }) {
  return (
    <div className={cn("flex justify-between gap-3 border-t border-line py-3 text-[15px] first:border-t-0", className)}>
      <span className="text-ink-muted">{label}</span>
      <span className={cn("text-right tabular-nums", strong ? "font-bold" : "font-semibold")}>{value}</span>
    </div>
  );
}

const badgeTones = {
  neutral: "bg-surface-sunken text-ink",
  flash: "bg-flash text-on-flash",
  soft: "bg-flash-soft text-ink",
  up: "bg-up-soft text-up",
  down: "bg-down-soft text-down",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
} as const;

export function Badge({ tone = "neutral", children, className }: { tone?: keyof typeof badgeTones; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-xs px-2 py-0.5 text-xs leading-5 font-semibold", badgeTones[tone], className)}>{children}</span>;
}

export const STATUS = {
  pending: { tone: "warning", label: "En attente" },
  processing: { tone: "info", label: "En cours" },
  done: { tone: "up", label: "Terminé" },
  rejected: { tone: "down", label: "Refusé" },
} as const;

export function StatusBadge({ status, label }: { status: keyof typeof STATUS; label?: string }) {
  const s = STATUS[status];
  return <Badge tone={s.tone}>{label ?? s.label}</Badge>;
}

const alertTones = {
  info: { box: "bg-info-soft", icon: "text-info", Icon: IconInfoCircle },
  warning: { box: "bg-warning-soft", icon: "text-warning", Icon: IconAlertTriangle },
  flash: { box: "bg-flash-soft", icon: "text-flash-text", Icon: IconBolt },
  up: { box: "bg-up-soft", icon: "text-up", Icon: IconCircleCheck },
  down: { box: "bg-down-soft", icon: "text-down", Icon: IconCircleX },
} as const;

export function Alert({ tone = "info", title, children, action, className }: { tone?: keyof typeof alertTones; title: string; children?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  const t = alertTones[tone];
  return (
    <div role={tone === "down" ? "alert" : "status"} className={cn("flex gap-3 rounded-lg p-4 text-ink", t.box, className)}>
      <t.Icon size={22} stroke={1.75} className={cn("mt-px shrink-0", t.icon)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="m-0 font-bold">{title}</p>
        {children && <div className="mt-0.5 text-sm leading-5 text-ink-muted">{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

export function IconTile({ children, tone = "sunken", size = 40, className }: { children: React.ReactNode; tone?: "sunken" | "flash" | "dark" | "up" | "info" | "soft"; size?: number; className?: string }) {
  const tones = { sunken: "bg-surface-sunken text-ink", flash: "bg-flash text-on-flash", dark: "bg-ink text-flash", up: "bg-up-soft text-up", info: "bg-info-soft text-info", soft: "bg-flash-soft text-flash-text" };
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-md", tones[tone], className)} style={{ width: size, height: size }}>
      {children}
    </span>
  );
}

const GLYPH = { btc: "/images/btc.png", eth: "/images/eth.png", bnb: "/images/bnb.png", doge: "/images/doge.png" } as const;

export function Glyph({ name, size, rotate = 0, className }: { name: keyof typeof GLYPH; size: number; rotate?: number; className?: string }) {
  return (
    <Image
      src={GLYPH[name]}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cn("pointer-events-none absolute drop-shadow-[0_12px_16px_rgba(17,17,16,.25)]", className)}
      style={{ rotate: `${rotate}deg` }}
    />
  );
}

/** Bandeau sombre décoré (soldes, montants mis en avant). */
export function Band({ children, className, stripes = "br" }: { children: React.ReactNode; className?: string; stripes?: "br" | "tr" | "none" }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-band p-5 text-on-band", className)}>
      {stripes !== "none" && (
        <div className={cn("pointer-events-none absolute", stripes === "br" ? "-right-1.5 -bottom-2" : "-top-1.5 -right-1.5")}>
          <Stripes count={4} height={64} />
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

export function EmptyState({ title, text, action, glyph = "btc" }: { title: string; text: string; action?: React.ReactNode; glyph?: keyof typeof GLYPH }) {
  return (
    <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-lg border border-dashed border-line-strong bg-surface-raised px-6 py-10 text-center">
      <div className="relative mb-2 h-20 w-28">
        <Glyph name={glyph} size={64} rotate={-10} className="top-2 left-6" />
        <div className="absolute right-0 bottom-0">
          <Stripes count={3} height={32} />
        </div>
      </div>
      <h2 className="text-h3 m-0">{title}</h2>
      <p className="m-0 max-w-[36ch] text-ink-muted">{text}</p>
      {action}
    </div>
  );
}

export function RiskBars({ risk }: { risk: number }) {
  return (
    <span className="flex gap-[3px]" aria-label={`Risque ${risk} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={cn("h-1.5 w-5 rounded-xs", i < risk ? "bg-ink" : "bg-line")} />
      ))}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-sunken", className)} />;
}

export function PageSkeleton() {
  return (
    <Page>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-36 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </Page>
  );
}
