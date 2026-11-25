"use client";
import { useEffect, useRef, useState } from "react";
import { IconArrowUp } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/** Bouton « retour en haut » : n'apparaît qu'en remontant la page, loin du haut. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const last = useRef(0);
  useEffect(() => {
    last.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setShow(y > window.innerHeight * 0.9 && y < last.current - 4);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      aria-label="Revenir en haut de la page"
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-5 left-4 z-30 grid size-12 place-items-center rounded-full bg-ink text-ink-inverse shadow-float transition-[transform,opacity] duration-500 ease-[var(--ease-out)] active:scale-90 md:bottom-6 md:left-6",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <IconArrowUp size={22} stroke={2} />
    </button>
  );
}
