"use client";
import { useEffect } from "react";

/** Service worker limité à /account/ (l'admin et le site public restent hors PWA). */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/account/sw.js", { scope: "/account/" }).catch(() => {});
  }, []);
  return null;
}
