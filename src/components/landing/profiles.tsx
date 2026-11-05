"use client";

import { useState } from "react";
import { AllocationDonut } from "@/components/ui/finance";
import { FloatingGlyph, Stripes } from "@/components/ui/decor";
import { profiles, type ProfileId } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const ORDER: ProfileId[] = ["careful", "balanced", "bold"];

export function Profiles() {
  const [id, setId] = useState<ProfileId>("balanced");
  const p = profiles[id];

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    const i = ORDER.indexOf(id);
    if (e.key === "ArrowRight") setId(ORDER[(i + 1) % ORDER.length]);
    if (e.key === "ArrowLeft") setId(ORDER[(i + ORDER.length - 1) % ORDER.length]);
  }

  return (
    <section id="profils" className="mx-auto max-w-[1200px] px-3 pb-14 md:px-8 md:pb-30">
      <div data-reveal className="relative grid gap-4 rounded-lg border border-line bg-surface-raised px-4 py-7 md:grid-cols-2 md:items-center md:gap-16 md:rounded-xl md:px-16 md:py-14">
        <div className="absolute top-0 right-0 h-[72px] w-[100px] overflow-hidden rounded-tr-lg md:h-[120px] md:w-[220px] md:rounded-tr-xl">
          <Stripes count={7} height={120} color="var(--flash-soft)" className="absolute top-0 -right-2 h-[72px] w-auto md:h-[120px]" />
        </div>
        <FloatingGlyph name="eth" size={84} rotate={-12} className="top-16 right-4 size-16 md:top-auto md:right-auto md:bottom-10 md:-left-9 md:size-[84px]" />
        <FloatingGlyph name="bnb" size={72} rotate={14} className="-bottom-7 right-10 z-10 hidden md:block" />

        <div className="relative flex flex-col gap-4 md:gap-5">
          <p className="text-overline text-ink-muted">Les profils</p>
          <h2 className="text-h1 md:text-display-lg">Un profil, une répartition</h2>

          <div role="tablist" aria-label="Profil" onKeyDown={onKey} className="flex gap-0.5 self-stretch rounded-md bg-surface-sunken p-[3px] md:self-start">
            {ORDER.map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                id={`tab-${k}`}
                aria-selected={id === k}
                aria-controls="profil-panel"
                tabIndex={id === k ? 0 : -1}
                onClick={() => setId(k)}
                className={cn(
                  "h-[34px] flex-1 rounded-sm px-3 text-sm font-semibold transition-colors md:flex-none md:px-4",
                  id === k ? "bg-surface-raised text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {profiles[k].label}
              </button>
            ))}
          </div>

          <div id="profil-panel" role="tabpanel" aria-labelledby={`tab-${id}`} className="flex min-h-[150px] flex-col gap-3">
            <h3 className="text-h3">{p.label}</h3>
            <p className="max-w-[44ch] text-body-sm text-ink-muted md:text-body">{p.text}</p>
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold md:text-sm">Niveau de risque</span>
              <div aria-hidden="true" className="flex flex-1 gap-1 md:flex-none">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={cn("h-2 flex-1 rounded-xs transition-colors md:w-7 md:flex-none", n <= p.risk ? "bg-ink" : "bg-line")} />
                ))}
              </div>
              <span className="text-amount-sm">{p.risk}/5</span>
            </div>
          </div>
          <p className="text-caption hidden text-ink-muted md:block">Répartition indicative, ajustée par FlashInv selon le marché.</p>
        </div>

        <div className="relative flex justify-center">
          <div className="w-full max-w-[460px] rounded-md border border-line bg-surface px-4 py-5 md:rounded-lg md:p-8">
            <AllocationDonut items={p.allocation} size={180} />
          </div>
        </div>
        <p className="text-caption text-ink-muted md:hidden">Répartition indicative, ajustée par FlashInv selon le marché.</p>
      </div>
    </section>
  );
}
