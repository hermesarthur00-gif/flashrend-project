"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconMenu2, IconX, iconProps } from "@/components/ui/icons";
import { navLinks } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * En-tête fixe : se cache quand on descend, réapparaît dès qu'on remonte.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        setScrolled(y > 8);
        if (y < 80) setHidden(false);
        else if (delta > 6) {
          setHidden(true);
          setOpen(false);
        } else if (delta < -6) setHidden(false);
        lastY.current = y;
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Réserve la hauteur de l'en-tête fixe */}
      <div aria-hidden="true" className="h-[68px] md:h-[84px]" />
      <header
        onFocusCapture={() => setHidden(false)}
        className={cn(
          "header-in fixed inset-x-0 top-0 z-30 transition-[transform,background-color,box-shadow] duration-300 ease-out",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
          scrolled ? "border-b border-line bg-surface/95 shadow-[0_1px_0_rgba(17,17,16,.02)]" : "bg-surface",
        )}
      >
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center gap-10 px-4 md:h-[84px] md:px-8">
          <Link href="/" aria-label="FlashRend, accueil" className="flex">
            <Logo size={30} />
          </Link>
          <nav aria-label="Navigation du site" className="hidden flex-1 gap-7 text-[15px] font-semibold lg:flex">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-ink no-underline hover:text-ink-muted">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 lg:ml-0 lg:gap-2">
            <ButtonLink href="/account/connexion" variant="ghost" className="hidden lg:inline-flex">
              Se connecter
            </ButtonLink>
            <ButtonLink href="/account/inscription" variant="primary" size="sm" className="lg:h-11 lg:rounded-md lg:px-5 lg:text-[15px]">
              Ouvrir un compte
            </ButtonLink>
            <Button
              variant="ghost"
              className="size-11 px-0 lg:hidden"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              aria-controls="menu-mobile"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <IconX size={22} {...iconProps} /> : <IconMenu2 size={22} {...iconProps} />}
            </Button>
          </div>
        </div>

        {open && (
          <nav
            id="menu-mobile"
            aria-label="Navigation du site"
            className="absolute inset-x-0 top-full flex flex-col border-y border-line bg-surface-raised px-4 pt-2 pb-4 shadow-overlay lg:hidden"
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3.5 text-lg font-bold text-ink no-underline last-of-type:border-b-0"
              >
                {l.label}
              </Link>
            ))}
            <ButtonLink href="/account/connexion" variant="secondary" block className="mt-2">
              Se connecter
            </ButtonLink>
          </nav>
        )}
      </header>
    </>
  );
}
