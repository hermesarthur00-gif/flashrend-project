"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  icon?: React.ReactNode;
  /** Retourne false pour garder la fenêtre ouverte (erreur). */
  onConfirm: () => Promise<boolean | void> | boolean | void;
};

/** Fenêtre de confirmation : fond qui s'assombrit, carte qui monte, focus piégé, Échap pour annuler. */
export function ConfirmDialog({ open, onClose, title, description, confirmLabel, cancelLabel = "Annuler", tone = "primary", icon, onConfirm }: Props) {
  const [busy, setBusy] = useState(false);
  const [closing, setClosing] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  const close = () => {
    if (busy) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 180);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const f = panelRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)");
        if (!f?.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close lit busy au moment de l'appel
  }, [open, busy]);

  if (!open || typeof document === "undefined") return null;

  const confirm = async () => {
    setBusy(true);
    const res = await onConfirm();
    setBusy(false);
    if (res !== false) onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-end p-3 sm:place-items-center sm:p-6">
      <div data-state={closing ? "closing" : "open"} onClick={close} className="dlg-backdrop absolute inset-0 bg-ink/55" aria-hidden="true" />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        data-state={closing ? "closing" : "open"}
        className="dlg-panel relative w-full max-w-[420px] rounded-xl border border-line bg-surface-raised p-6 shadow-overlay"
      >
        {icon && <span className={cn("mb-4 grid size-12 place-items-center rounded-full", tone === "danger" ? "bg-down-soft text-down" : "bg-flash text-on-flash")}>{icon}</span>}
        <h2 id={titleId} className="text-h3 m-0">
          {title}
        </h2>
        <p id={descId} className="mt-2 mb-6 text-[15px] leading-6 text-ink-muted">
          {description}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button ref={cancelRef} variant="ghost" size="lg" onClick={close} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "dark" : "primary"} size="lg" onClick={confirm} disabled={busy}>
            {busy ? "Un instant…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
