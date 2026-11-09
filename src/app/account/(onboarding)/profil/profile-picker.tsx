"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { IconCheck, IconChevronLeft } from "@tabler/icons-react";
import { toast } from "sonner";
import { AllocationDonut } from "@/components/ui/finance";
import { Alert, Card, RiskBars } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import type { CryptoSymbol } from "@/lib/landing-data";
import { PROFILE_LABELS, PROFILE_RISK, cn, type ProfileKey } from "@/lib/utils";
import { chooseProfile } from "./actions";

const TEXT: Record<ProfileKey, string> = {
  CAREFUL: "Une large part en stablecoin. Des variations plus douces.",
  BALANCED: "Les grandes cryptos au cœur, une réserve pour amortir les baisses.",
  BOLD: "Viser plus haut en acceptant de fortes variations.",
};

export function ProfilePicker({ current, allocations, invested }: { current: ProfileKey | null; allocations: Record<ProfileKey, { symbol: string; percent: number }[]>; invested: boolean }) {
  const [selected, setSelected] = useState<ProfileKey>(current ?? "BALANCED");
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col lg:py-10">
      <header className="flex h-14 items-center gap-2 px-2">
        <Link href={current ? "/account/reglages" : "/account/verification"} aria-label="Retour" className="grid size-11 place-items-center rounded-md hover:bg-ink/8">
          <IconChevronLeft size={22} stroke={1.75} />
        </Link>
        <h1 className="m-0 flex-1 text-center text-[17px] font-bold">Votre profil</h1>
        <span className="w-11" />
      </header>
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-2 pb-4">
        <div>
          <h2 className="text-h2 m-0 mb-1.5">Quel risque acceptez-vous ?</h2>
          <p className="m-0 text-ink-muted">Vous pourrez changer de profil plus tard, depuis les réglages.</p>
        </div>
        <div role="radiogroup" aria-label="Profil" className="flex flex-col gap-3">
          {(Object.keys(PROFILE_LABELS) as ProfileKey[]).map((p) => {
            const sel = p === selected;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => setSelected(p)}
                className={cn("flex w-full flex-col gap-2 rounded-lg p-4 text-left text-ink", sel ? "border-2 border-ink bg-flash-soft" : "border border-line bg-surface-raised")}
              >
                <span className="flex w-full items-center gap-2.5">
                  {sel ? (
                    <span className="grid size-[22px] place-items-center rounded-full bg-ink text-flash">
                      <IconCheck size={16} stroke={3} />
                    </span>
                  ) : (
                    <span className="size-[22px] rounded-full border-2 border-line-strong" />
                  )}
                  <span className="flex-1 text-[17px] font-bold">
                    {PROFILE_LABELS[p]}
                    {current === p && <span className="ml-2 text-sm font-semibold text-ink-muted">actuel</span>}
                  </span>
                  <RiskBars risk={PROFILE_RISK[p]} />
                </span>
                <span className="pl-8 text-sm leading-5 text-ink-muted">{TEXT[p]}</span>
              </button>
            );
          })}
        </div>
        <Card>
          <p className="text-overline m-0 mb-3 text-ink-muted">Répartition {PROFILE_LABELS[selected].toLowerCase()}</p>
          <AllocationDonut items={allocations[selected].map((a) => ({ symbol: a.symbol as CryptoSymbol, value: a.percent }))} size={128} />
        </Card>
        {invested && current !== selected && (
          <Alert tone="info" title="Votre portefeuille sera réparti à nouveau">
            Vos cryptos actuelles sont échangées pour suivre la répartition du profil {PROFILE_LABELS[selected].toLowerCase()}, aux cours du moment.
          </Alert>
        )}
        <Alert tone="warning" title="La valeur peut baisser">
          Investir en crypto comporte un risque de perte en capital.
        </Alert>
      </div>
      <div className="sticky bottom-0 border-t border-line bg-surface px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] lg:static lg:border-0">
        <Button
          size="lg"
          block
          disabled={pending || current === selected}
          onClick={() =>
            start(async () => {
              const res = await chooseProfile(selected);
              if (res?.error) toast.error(res.error);
            })
          }
        >
          {pending ? "Un instant…" : current === selected ? "Profil actuel" : `Choisir le profil ${PROFILE_LABELS[selected]}`}
        </Button>
      </div>
    </div>
  );
}
