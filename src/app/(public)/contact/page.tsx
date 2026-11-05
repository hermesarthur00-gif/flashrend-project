import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/landing/page-shell";
import { ContactForm } from "@/components/landing/contact-form";
import { Stripes } from "@/components/ui/decor";
import { IconBell, IconShieldCheck, iconProps } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur FlashInv ? Écrivez-nous.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Parlons-en." lead="Une question sur FlashInv, votre compte ou un partenariat ? Écrivez-nous, on vous répond par e-mail." glyph="doge" />

      <section className="mx-auto grid max-w-[1200px] gap-10 px-4 pt-12 pb-16 md:grid-cols-12 md:gap-16 md:px-8 md:pt-20 md:pb-24">
        <div data-reveal className="md:col-span-7">
          <h2 className="text-h2 mb-6 md:text-h1">Envoyer un message</h2>
          <ContactForm />
        </div>

        <aside data-reveal className="flex flex-col gap-4 md:col-span-5">
          <div className="relative overflow-hidden rounded-xl bg-band p-6 text-on-band md:p-8">
            <Stripes count={4} height={72} color="var(--flash)" className="absolute top-5 right-5" />
            <p className="text-overline text-flash">Par e-mail</p>
            <a href={`mailto:${siteConfig.contactEmail}`} className="relative mt-6 block font-display text-[24px] leading-8 break-all text-on-band no-underline hover:text-flash md:text-[28px]">
              {siteConfig.contactEmail}
            </a>
            <p className="relative mt-3 max-w-[30ch] text-sm opacity-80">Pour toute question générale, partenariat ou demande presse.</p>
          </div>

          <div className="flex gap-4 rounded-lg border border-line bg-surface-raised p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-flash-soft text-flash-text">
              <IconBell size={22} {...iconProps} />
            </span>
            <div>
              <h3 className="mb-1 text-base font-bold">Vous êtes client ?</h3>
              <p className="text-body-sm text-ink-muted">
                Pour une question sur un dépôt, un retrait ou votre profil, écrivez-nous depuis votre espace : nous retrouverons votre dossier plus vite.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-lg border border-line bg-surface-raised p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-flash-soft text-flash-text">
              <IconShieldCheck size={22} {...iconProps} />
            </span>
            <div>
              <h3 className="mb-1 text-base font-bold">Attention aux arnaques</h3>
              <p className="text-body-sm text-ink-muted">
                FlashInv ne vous demandera jamais votre mot de passe, vos codes ni un virement vers un autre compte que celui affiché dans votre espace.{" "}
                <Link href="/risques" className="font-semibold text-ink underline">En savoir plus</Link>
              </p>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
