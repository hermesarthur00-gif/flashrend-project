import Image from "next/image";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { AllocationDonut, AssetRow, BalanceCard, PriceChange, Sparkline } from "@/components/ui/finance";
import { BoltWatermark, FloatingGlyph, Stripes } from "@/components/ui/decor";
import { IconArrowRight, IconBell, IconBuildingBank, IconCircleCheck, iconProps } from "@/components/ui/icons";
import { profiles } from "@/lib/landing-data";

function Phone({ children, className, label }: { children: React.ReactNode; className?: string; label: string }) {
  return (
    <div role="img" aria-label={label} data-hero-phone className={`absolute rounded-[36px] bg-[#111110] p-2 shadow-float ${className ?? ""}`}>
      <div className="flex h-full flex-col gap-3 overflow-hidden rounded-[28px] bg-surface p-4">{children}</div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="mx-auto max-w-[1200px] px-3 pt-1 md:px-8 md:pt-2">
      <div className="overflow-hidden rounded-xl bg-band">
        <div className="relative grid gap-6 overflow-hidden rounded-xl bg-flash px-5 pt-7 pb-6 text-on-flash md:grid-cols-2 md:items-center md:py-16 md:pr-0 md:pl-16">
          <BoltWatermark className="-right-36 top-10 size-[420px] md:-bottom-64 md:-left-28 md:right-auto md:top-auto md:size-[620px]" />

          <div data-hero-copy className="relative flex flex-col gap-4 md:gap-5">
            <p className="text-overline self-start rounded-sm bg-on-flash px-3 py-1.5 text-flash">Crypto sans prise de tête</p>
            <p className="text-body-lg max-w-[30ch] md:text-[22px] md:leading-8">
              Vous choisissez un profil et un montant. FlashInv répartit votre argent sur les cryptos qui vous correspondent et suit tout pour vous.
            </p>
            <div className="flex flex-col gap-2 md:mt-2 md:flex-row md:flex-wrap">
              <ButtonLink href="/account/inscription" variant="band" size="lg">
                Ouvrir un compte <IconArrowRight size={20} {...iconProps} />
              </ButtonLink>
              <ButtonLink href="#comment" variant="ghost" size="lg">
                Voir comment ça marche
              </ButtonLink>
            </div>
            <p className="mt-1 hidden items-center gap-2 text-sm font-medium md:flex">
              <IconBuildingBank size={18} {...iconProps} /> Dépôt par virement, en euros.
            </p>
          </div>

          {/* Composition : écrans de l'app + illustrations */}
          <div className="relative h-[470px] md:h-[540px]">
            <Phone label="Écran de choix du profil" className="top-[70px] left-[-6px] h-[316px] w-[170px] -rotate-8 md:left-0 md:h-[416px] md:w-[230px]">
              <span className="text-xs font-bold md:text-[13px]">Votre profil</span>
              <div className="flex flex-col gap-1.5 text-[11px] md:text-xs">
                <div className="rounded-md border border-line p-2 font-semibold">Prudent</div>
                <div className="flex justify-between rounded-md border-2 border-ink bg-flash-soft p-2 font-bold">
                  Équilibré <span>3/5</span>
                </div>
                <div className="rounded-md border border-line p-2 font-semibold">Dynamique</div>
              </div>
              <div className="hidden md:block">
                <AllocationDonut items={profiles.balanced.allocation} size={110} />
              </div>
            </Phone>

            <Image
              src="/images/nft-eth.png"
              alt=""
              aria-hidden="true"
              width={666}
              height={374}
              className="pointer-events-none absolute top-[70px] -right-16 w-[200px] rotate-8 drop-shadow-[0_18px_24px_rgba(17,17,16,.25)] md:top-[60px] md:-right-[70px] md:w-[300px]"
            />

            <Phone label="Écran d'accueil de l'app : solde et actifs" className="top-0 left-1/2 h-[436px] w-[232px] -translate-x-1/2 md:h-[520px] md:w-[276px]">
              <div className="flex items-center gap-2">
                <Logo variant="symbol" size={22} />
                <span className="flex-1 text-sm font-bold">Bonjour Awa</span>
                <IconBell size={20} {...iconProps} />
              </div>
              <BalanceCard amount={2480.36} gain={214.9} />
              <div>
                <AssetRow symbol="BTC" value={1116.16} change={2.41} />
                <AssetRow symbol="ETH" value={620.09} change={-1.18} />
                <AssetRow symbol="USDT" value={496.07} change={0} />
              </div>
            </Phone>

            {/* Puces flottantes */}
            <div className="absolute inset-x-0 bottom-1.5 flex animate-bob items-start gap-3 rounded-md bg-ink p-3 pl-4 text-ink-inverse shadow-overlay md:right-auto md:bottom-8 md:-left-10 md:w-[270px]">
              <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-up-soft text-up">
                <IconCircleCheck size={20} {...iconProps} />
              </span>
              <span>
                <span className="block text-[15px] leading-5 font-bold">Virement reçu</span>
                <span className="block text-[13px] leading-[18px] opacity-80">+500,00 $ placés sur votre profil</span>
              </span>
            </div>
            <div className="absolute top-[330px] -right-2 hidden animate-bob flex-col gap-1.5 rounded-md bg-surface-raised px-3.5 py-3 text-ink shadow-float [animation-delay:1s] md:flex">
              <span className="text-caption text-ink-muted">Ce mois-ci</span>
              <span className="flex items-center gap-2.5">
                <Sparkline data={[3, 3.4, 3.1, 3.8, 3.6, 4.2, 4.1, 4.7]} width={64} height={24} />
                <PriceChange value={3.2} soft />
              </span>
            </div>

            <FloatingGlyph name="btc" size={92} rotate={-14} className="-top-6 right-2.5 size-[72px] md:-top-6 md:right-auto md:left-3 md:size-[92px]" />
            <FloatingGlyph name="eth" size={100} rotate={12} className="-bottom-9 left-[170px] hidden md:block" />
          </div>
        </div>

        <div className="relative px-5 pt-7 pb-8 md:px-16 md:pt-12 md:pb-16">
          <h1 data-hero-title className="relative m-0 max-w-[14ch] font-display text-[44px] leading-[42px] font-normal tracking-[-0.03em] text-on-band md:text-[88px] md:leading-[84px]">
            Placez en crypto sans être expert.
          </h1>
          <div className="mt-3 flex items-end justify-between md:mt-0">
            <Stripes count={4} height={40} className="md:hidden" />
            <Image
              src="/images/buste-3d.png"
              alt=""
              aria-hidden="true"
              width={591}
              height={422}
              className="pointer-events-none -mr-5 -mb-8 w-[250px] md:absolute md:right-10 md:bottom-0 md:m-0 md:w-[400px]"
            />
          </div>
        </div>
      </div>
      <p className="mx-2 mt-4 flex items-center gap-2 text-sm font-medium text-ink-muted md:hidden">
        <IconBuildingBank size={18} {...iconProps} /> Dépôt par virement, en euros.
      </p>
    </section>
  );
}
