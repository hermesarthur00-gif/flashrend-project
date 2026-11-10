"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Recharge la page tant qu'un envoi est en cours, pour suivre l'avancement. */
export function AutoRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [active, router]);
  return null;
}
