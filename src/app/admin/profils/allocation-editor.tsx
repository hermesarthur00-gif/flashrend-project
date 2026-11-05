"use client";
import { useState } from "react";
import { ActionForm } from "@/components/admin/action-form";
import { SubmitButton } from "@/components/app/form";
import { Badge } from "@/components/app/primitives";
import { AllocationDonut } from "@/components/ui/finance";
import { AssetIcon } from "@/components/account/widgets";
import type { CryptoSymbol } from "@/lib/landing-data";
import { PROFILE_LABELS, PROFILE_RISK, cn, type ProfileKey } from "@/lib/utils";
import { saveAllocation } from "../actions";

export function AllocationEditor({ profile, assets, initial, clients }: { profile: ProfileKey; assets: { symbol: string; name: string }[]; initial: Record<string, number>; clients: number }) {
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(assets.map((a) => [a.symbol, initial[a.symbol] ? String(initial[a.symbol]).replace(".", ",") : ""])));
  const parsed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Number(v.replace(",", ".")) || 0]));
  const total = Object.values(parsed).reduce((s, v) => s + v, 0);
  const ok = Math.abs(total - 100) < 0.001;

  return (
    <ActionForm action={saveAllocation} className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface-raised p-[22px]">
      <input type="hidden" name="profile" value={profile} />
      <div className="flex items-center justify-between">
        <h2 className="text-h2 m-0">{PROFILE_LABELS[profile]}</h2>
        <Badge tone="flash">Risque {PROFILE_RISK[profile]}/5</Badge>
      </div>
      <AllocationDonut items={Object.entries(parsed).filter(([, v]) => v > 0).map(([symbol, value]) => ({ symbol: symbol as CryptoSymbol, value }))} size={96} />
      <div>
        {assets.map((a) => (
          <label key={a.symbol} className="flex items-center gap-2.5 border-t border-line py-2">
            <AssetIcon symbol={a.symbol} size={28} />
            <span className="flex-1 font-semibold">{a.name}</span>
            <input
              name={`p_${a.symbol}`}
              aria-label={`Part ${a.name}`}
              inputMode="decimal"
              value={values[a.symbol]}
              onChange={(e) => setValues((v) => ({ ...v, [a.symbol]: e.target.value.replace(/[^\d,.]/g, "") }))}
              placeholder="0"
              className="h-9 w-16 rounded-sm border border-line-strong bg-surface px-2.5 text-right font-semibold tabular-nums outline-none focus:border-ink"
            />
            <span className="w-3.5 text-ink-muted">%</span>
          </label>
        ))}
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-ink-muted">Total</span>
        <strong className={cn(!ok && "text-down")}>{total.toLocaleString("fr-FR")} %</strong>
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" name="rebalance" className="size-[18px] accent-ink" />
        Rééquilibrer les {clients} client{clients > 1 ? "s" : ""} de ce profil
      </label>
      <SubmitButton size="md" disabled={!ok} pendingLabel="Enregistrement…">
        Enregistrer
      </SubmitButton>
    </ActionForm>
  );
}
