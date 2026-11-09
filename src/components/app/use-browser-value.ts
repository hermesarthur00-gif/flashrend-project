"use client";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Lit une valeur du navigateur (localStorage, URL…) sans écart d'hydratation. */
export function useBrowserValue<T extends string | boolean | null>(read: () => T, server: T): T {
  return useSyncExternalStore(noop, read, () => server);
}
