"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconMenu2, IconX, iconProps } from "@/components/ui/icons";
import { navLinks } from "@/lib/site-config";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-[1200px] items-center gap-10 px-4 py-3 md:px-8 md:py-5">
        <a href="#top" aria-label="FlashInv, accueil" className="flex">
          <Logo size={30} />
        </a>
        <nav aria-label="Navigation du site" className="hidden flex-1 gap-7 text-[15px] font-semibold lg:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-ink no-underline hover:text-ink-muted">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 lg:ml-0 lg:gap-2">
          <ButtonLink href="/connexion" variant="ghost" className="hidden lg:inline-flex">
            Se connecter
          </ButtonLink>
          <ButtonLink href="/inscription" variant="primary" size="sm" className="lg:h-11 lg:px-5 lg:text-[15px] lg:rounded-md">
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
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-3.5 text-lg font-bold text-ink no-underline last-of-type:border-b-0"
            >
              {l.label}
            </a>
          ))}
          <ButtonLink href="/connexion" variant="secondary" block className="mt-2">
            Se connecter
          </ButtonLink>
        </nav>
      )}
    </header>
  );
}
