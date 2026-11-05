import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/landing/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { BOLT_PATH } from "@/components/ui/logo";
import { Coin, FloatingGlyph, Stripes } from "@/components/ui/decor";
import { IconArrowRight, IconEye, IconShieldCheck, iconProps } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "À propos",
  description: "FlashInv rend l'investissement en crypto simple pour les débutants : un profil, un virement, et nous gérons la répartition.",
};

const principles = [
  {
    title: "Simple",
    text: "Trois profils, un virement, un tableau de bord lisible. Vous n'avez pas besoin de comprendre la blockchain pour investir.",
    icon: "bolt",
  },
  {
    title: "Transparent",
    text: "Votre solde, votre répartition et les frais sont visibles à tout moment. Aucune opération ne se fait sans apparaître dans votre historique.",
    icon: "eye",
  },
  {
    title: "Prudent avec votre argent",
    text: "Comptes vérifiés, double authentification et rappel clair des risques avant chaque placement.",
    icon: "shield",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="À propos"
        title="La crypto, enfin à portée de tous."
        lead="FlashInv est né d'un constat simple : beaucoup de gens veulent investir en crypto, mais ne savent pas par où commencer."
        glyph="btc"
      />

      {/* Mission */}
      <section className="mx-auto grid max-w-[1200px] gap-8 px-4 pt-14 pb-12 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:pt-24 md:pb-20">
        <div data-reveal className="flex flex-col gap-4">
          <p className="text-overline text-ink-muted">Notre mission</p>
          <h2 className="text-h1 md:text-display-lg">Investir sans y passer ses soirées</h2>
          <p className="text-ink-muted md:text-body-lg">
            Acheter des cryptos soi-même demande du temps : ouvrir des comptes sur des plateformes, choisir des actifs, surveiller les cours, rééquilibrer. FlashInv fait ce travail pour vous.
          </p>
          <p className="text-ink-muted md:text-body-lg">
            Vous choisissez le niveau de risque qui vous convient, vous faites un virement, et nous répartissons vos fonds sur un panier de cryptos adapté à votre profil.
          </p>
        </div>
        <div data-reveal className="relative mx-auto w-full max-w-[460px]">
          <div className="absolute inset-[20px_-14px_-14px_20px] rounded-xl bg-flash" />
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-band">
            <Stripes count={5} height={120} color="var(--flash)" className="absolute top-6 left-6" />
            <Image src="/images/buste-3d.png" alt="" aria-hidden="true" width={591} height={422} className="relative w-[86%]" />
          </div>
          <FloatingGlyph name="eth" size={84} rotate={-12} className="-bottom-6 -left-6 size-16 md:size-[84px]" />
          <Coin tone="black" size={80} tilt={50} spin={14} className="absolute -top-6 -right-4" />
        </div>
      </section>

      {/* Principes */}
      <section className="mx-auto max-w-[1200px] px-3 pb-14 md:px-8 md:pb-24">
        <div className="rounded-xl bg-band px-4 pt-9 pb-4 text-on-band md:px-16 md:py-16">
          <p data-reveal className="text-overline text-flash">Ce qui nous guide</p>
          <h2 data-reveal className="text-h1 mt-3 mb-8 text-on-band md:text-display-lg md:mb-12">Nos principes</h2>
          <ol data-reveal-group className="m-0 list-none p-0">
            {principles.map((p, i) => (
              <li key={p.title} className="grid grid-cols-[48px_minmax(0,1fr)] gap-4 border-t border-on-band/20 py-6 md:grid-cols-[96px_minmax(0,1fr)_minmax(0,1.4fr)] md:items-center md:gap-10 md:py-8">
                <span className="font-display text-[36px] leading-none text-flash md:text-[56px]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="flex items-center gap-3 text-xl leading-7 font-bold md:text-h2">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-flash text-on-flash">
                    {p.icon === "eye" ? <IconEye size={22} {...iconProps} /> : p.icon === "shield" ? <IconShieldCheck size={22} {...iconProps} /> : <svg viewBox="0 0 100 100" className="size-6" aria-hidden="true"><path d={BOLT_PATH} fill="currentColor" /></svg>}
                  </span>
                  {p.title}
                </h3>
                <p className="col-start-2 opacity-80 md:col-start-auto md:text-body-lg">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-4 pb-16 md:px-8 md:pb-24">
        <div data-reveal className="flex flex-col items-start gap-6 border-t border-line pt-10 md:flex-row md:items-end md:justify-between">
          <h2 className="text-h1 max-w-[18ch] md:text-display-lg">Prêt à faire travailler votre argent ?</h2>
          <ButtonLink href="/inscription" size="lg">
            Ouvrir un compte <IconArrowRight size={20} {...iconProps} />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
