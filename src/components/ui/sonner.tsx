"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/** Notifications internes (composant Sonner de shadcn/ui, aux couleurs FlashInv). */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      closeButton
      toastOptions={{
        classNames: {
          toast: "!rounded-md !border-0 !bg-ink !text-ink-inverse !shadow-overlay !font-sans",
          title: "!text-[15px] !font-bold",
          description: "!text-[13px] !opacity-80",
          success: "[&_[data-icon]]:!text-up-fill",
          error: "[&_[data-icon]]:!text-down-fill",
          closeButton: "!bg-ink !text-ink-inverse !border-ink-muted",
        },
      }}
      style={
        {
          "--normal-bg": "var(--ink)",
          "--normal-text": "var(--ink-inverse)",
          "--normal-border": "var(--ink)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
