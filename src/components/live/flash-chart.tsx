"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBolt, IconArrowUpRight } from "@tabler/icons-react";
import { FLASH_MS } from "@/lib/flash";
import { cn, formatEUR } from "@/lib/utils";

const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
};
const snapshot = () => Math.floor(Date.now() / 1000) * 1000;
/** Heure courante à la seconde (0 au rendu serveur, pour éviter tout écart d'hydratation). */
export function useClock() {
  return useSyncExternalStore(subscribe, snapshot, () => 0);
}

export function formatRemaining(ms: number) {
  const m = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(m / 60);
  return h > 0 ? `${h} h ${String(m % 60).padStart(2, "0")} min` : `${m} min`;
}

const HOURS_LABELS = ["0 h", "6 h", "12 h", "18 h", "24 h"];

/**
 * Courbe d'un investissement Flash : le montant progresse en ligne droite jusqu'à montant + rendement à 24 h.
 * Sans `startsAt`, c'est la projection avant souscription. Avec `startsAt`, un point marque l'instant présent.
 */
export function FlashChart({ amount, gain, startsAt, height = 150 }: { amount: number; gain: number; startsAt?: number; height?: number }) {
  const now = useClock();
  const W = 600;
  const H = height;
  const min = amount;
  const max = amount + gain;
  const rng = max - min || 1;
  const x = (f: number) => f * W;
  const y = (v: number) => H - 10 - ((v - min) / rng) * (H - 20);
  const progress = startsAt && now ? Math.min(1, Math.max(0, (now - startsAt) / FLASH_MS)) : startsAt ? 0 : null;
  const endY = y(max);
  const startY = y(min);
  const doneY = progress === null ? endY : y(min + gain * progress);
  const color = "var(--up)";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Évolution de ${formatEUR(amount)} à ${formatEUR(max)} en 24 heures`} className="block w-full" style={{ height }}>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={x(f)} x2={x(f)} y1={0} y2={H} stroke="var(--line)" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          ))}
          <polygon points={`0,${H} 0,${startY} ${W * (progress ?? 1)},${doneY} ${W * (progress ?? 1)},${H}`} fill={color} opacity={0.1} />
          {progress === null ? (
            <line x1={0} y1={startY} x2={W} y2={endY} stroke={color} strokeWidth={2.5} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          ) : (
            <>
              <line x1={W * progress} y1={doneY} x2={W} y2={endY} stroke="var(--line-strong)" strokeWidth={2} strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
              <line x1={0} y1={startY} x2={W * progress} y2={doneY} stroke={color} strokeWidth={2.5} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
            </>
          )}
        </svg>
        {progress !== null && now > 0 && <span className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-up" style={{ left: `${progress * 100}%`, top: `${(doneY / H) * 100}%` }} aria-hidden="true" />}
        <span className="pointer-events-none absolute right-0 size-2.5 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-up bg-surface-raised" style={{ top: `${(endY / H) * 100}%` }} aria-hidden="true" />
      </div>
      <div className="flex justify-between text-xs text-ink-muted tabular-nums" aria-hidden="true">
        {HOURS_LABELS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export type FlashItem = { id: string; offerName: string; ratePercent: number; amount: number; gain: number; startsAt: number; endsAt: number };

/** Investissement Flash en cours : compte à rebours, progression et courbe. */
export function LiveFlashCard({ f, compact = false }: { f: FlashItem; compact?: boolean }) {
  const now = useClock();
  const router = useRouter();
  const refreshed = useRef(false);
  const ended = now > 0 && now >= f.endsAt;
  const progress = now ? Math.min(1, Math.max(0, (now - f.startsAt) / FLASH_MS)) : 0;
  const earned = f.gain * progress;
  useEffect(() => {
    // À l'échéance, le serveur verse le montant : on recharge la page une seule fois.
    if (ended && !refreshed.current) {
      refreshed.current = true;
      const t = setTimeout(() => router.refresh(), 1500);
      return () => clearTimeout(t);
    }
  }, [ended, router]);
  return (
    <section aria-label={`Flash 24 h, ${f.offerName}`} className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-flash text-on-flash">
            <IconBolt size={20} stroke={2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-h3 m-0">Flash 24 h</h2>
            <p className="m-0 truncate text-sm text-ink-muted">
              {f.offerName} · rendement {f.ratePercent.toLocaleString("fr-FR")} %
            </p>
          </div>
        </div>
        {compact && (
          <Link href="/account/flash" className="shrink-0 text-sm font-semibold text-ink underline underline-offset-2">
            Détail
          </Link>
        )}
      </div>
      <dl className="m-0 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-caption text-ink-muted">Montant bloqué</dt>
          <dd className="text-amount m-0 mt-0.5 text-lg tabular-nums">{formatEUR(f.amount)}</dd>
        </div>
        <div>
          <dt className="text-caption text-ink-muted">À l&apos;échéance</dt>
          <dd className="text-amount m-0 mt-0.5 text-lg tabular-nums">{formatEUR(f.amount + f.gain)}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-0.5 font-semibold text-up tabular-nums">
          <IconArrowUpRight size={16} stroke={2.5} aria-hidden="true" />+{formatEUR(f.gain)}
        </span>
        <span className="text-ink-muted">de rendement, versé à l&apos;échéance</span>
      </div>
      {!compact && <FlashChart amount={f.amount} gain={f.gain} startsAt={f.startsAt} />}
      <div className="flex flex-col gap-1.5">
        <div className="h-2 overflow-hidden rounded-full bg-surface-sunken" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Avancement">
          <div className={cn("h-full rounded-full bg-flash")} style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="m-0 flex justify-between gap-3 text-sm text-ink-muted tabular-nums">
          <span>{now === 0 ? " " : ended ? "Versement en cours…" : `Il reste ${formatRemaining(f.endsAt - now)}`}</span>
          <span>{now ? `${formatEUR(earned)} acquis au prorata` : " "}</span>
        </p>
      </div>
    </section>
  );
}
