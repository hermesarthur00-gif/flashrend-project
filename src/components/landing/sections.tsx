import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { ASSETS, CryptoIcon, PriceChange } from "@/components/ui/finance";
import { BoltWatermark, Coin, FloatingGlyph, Stripes } from "@/components/ui/decor";
import { IconArrowRight, IconBuildingBank, IconCircleCheck, IconEye, IconId, IconShieldCheck, iconProps } from "@/components/ui/icons";
import { getFaq, profiles, security, steps, ticker as fallbackTicker, type CryptoSymbol } from "@/lib/landing-data";
import { getPublicConfig } from "@/lib/server/public-config";
import { getMarket } from "@/lib/server/prices";
import { navLinks } from "@/lib/site-config";
import { formatEUR } from "@/lib/utils";

/* ---------------- Bandeau des cours ---------------- */
const TICKER_ORDER: CryptoSymbol[] = ["BTC", "ETH", "SOL", "BNB", "DOGE", "USDT"];

export async function Ticker() {
  const market = await getMarket();
  const live = TICKER_ORDER.map((sym) => market.find((m) => m.symbol === sym && m.priceEur > 0)).filter((m) => m !== undefined);
  const ticker = live.length === TICKER_ORDER.length ? live.map((m) => ({ symbol: m.symbol as CryptoSymbol, name: m.name, price: m.priceEur, change: m.change24h })) : fallbackTicker;
  const loop = [...ticker, ...ticker];
  return (
    <section aria-label="Cours des cryptos" className="relative mt-5 overflow-hidden border-y border-line bg-surface-raised md:mt-7">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {loop.map((t, i) => (
          <div key={i} aria-hidden={i >= ticker.length} className="flex items-center gap-2.5 border-r border-line px-5 py-3 md:px-7 md:py-4">
            <CryptoIcon symbol={t.symbol} size={26} />
            <span className="text-[15px] font-bold">
              <span className="md:hidden">{t.symbol}</span>
              <span className="hidden md:inline">{t.name}</span>
            </span>
            <span className="text-[15px] font-semibold tabular-nums">{t.price < 1 ? `${t.price.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}\u00a0$` : formatEUR(t.price)}</span>
            <PriceChange value={t.change} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Comment ça marche ---------------- */
function StepVisual({ i }: { i: number }) {
  if (i === 0)
    return (
      <div className="relative h-[120px] overflow-hidden rounded-lg border border-line bg-surface-raised md:h-[140px]">
        <div className="absolute top-5 left-4 flex h-[90px] w-[146px] -rotate-4 gap-2.5 rounded-md bg-band p-3">
          <div className="h-11 w-9 rounded-xs bg-flash" />
          <div className="flex flex-1 flex-col gap-1.5 pt-1">
            <span className="h-1.5 w-4/5 rounded-full bg-on-band/70" />
            <span className="h-1.5 w-3/5 rounded-full bg-on-band/35" />
            <span className="h-1.5 w-[70%] rounded-full bg-on-band/35" />
          </div>
        </div>
        <div className="absolute right-4 bottom-4 grid size-14 place-items-center rounded-full border-3 border-surface-raised bg-flash-soft text-up ring-2 ring-up md:size-16">
          <IconCircleCheck size={24} {...iconProps} />
        </div>
      </div>
    );
  if (i === 1)
    return (
      <div className="flex flex-col justify-center gap-1.5 rounded-lg border border-line bg-surface-raised p-3 text-xs md:h-[140px] md:p-4">
        <div className="flex justify-between rounded-sm border border-line px-2.5 py-2 font-semibold">
          Prudent <span className="text-ink-muted">2/5</span>
        </div>
        <div className="flex justify-between rounded-sm border-2 border-ink bg-flash px-2.5 py-2 font-bold text-on-flash">
          Équilibré <span>3/5</span>
        </div>
        <div className="flex justify-between rounded-sm border border-line px-2.5 py-2 font-semibold">
          Dynamique <span className="text-ink-muted">5/5</span>
        </div>
      </div>
    );
  return (
    <div className="relative flex h-[110px] flex-col gap-1 overflow-hidden rounded-lg bg-band p-4 text-on-band md:h-[140px]">
      <span className="text-caption text-flash">VIREMENT</span>
      <span className="text-[26px] leading-8 font-bold tabular-nums">500,00 €</span>
      <span className="text-xs opacity-75">vers FlashInv</span>
      <Stripes count={4} height={64} className="absolute -right-2.5 -bottom-3.5" />
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="comment" className="mx-auto grid max-w-[1200px] gap-3 px-4 pt-14 pb-12 md:grid-cols-12 md:gap-12 md:px-8 md:pt-28 md:pb-24">
      <div data-reveal className="relative flex flex-col gap-3 md:col-span-5 md:gap-4">
        <p className="text-overline text-ink-muted">Comment ça marche</p>
        <h2 className="text-h1 md:text-display-lg">Trois étapes pour commencer</h2>
        <p className="text-ink-muted md:text-body-lg md:max-w-[36ch]">
          Pas de jargon, pas de graphiques à surveiller. Vous décidez du niveau de risque, on s&apos;occupe du reste.
        </p>
        {/* Visuel : confirmation d'un investissement */}
        <div className="relative mt-4 mr-3 mb-6 md:mt-6 md:mr-0 md:mb-0">
          <div className="absolute inset-[16px_-12px_-12px_16px] rounded-lg bg-flash md:inset-[24px_-16px_-16px_24px] md:rounded-xl" />
          <div
            role="img"
            aria-label="Écran de l'app : investissement de 250 euros confirmé sur le profil équilibré"
            className="relative flex h-[500px] items-end justify-center overflow-hidden rounded-lg bg-band px-6 pt-10 md:h-auto md:aspect-[4/5] md:rounded-xl"
          >
            <Stripes count={5} height={120} color="var(--flash)" className="absolute top-6 left-6" />
            <div className="relative w-[250px] rounded-t-[34px] bg-[#111110] px-2 pt-2 shadow-float md:w-[280px]">
              <div className="flex flex-col items-center gap-3 rounded-t-[27px] bg-surface px-4 pt-6 pb-5 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-up-soft text-up">
                  <IconCircleCheck size={30} {...iconProps} />
                </span>
                <span className="text-sm font-bold">Investissement confirmé</span>
                <span className="text-[34px] leading-10 font-bold tracking-tight tabular-nums">250,00 €</span>
                <span className="rounded-xs bg-flash-soft px-2 py-0.5 text-xs font-semibold text-flash-text">Profil équilibré · risque 3/5</span>
                <div className="mt-1 w-full text-left">
                  {profiles.balanced.allocation.map((a) => (
                    <div key={a.symbol} className="flex items-center gap-2 border-t border-line py-2 text-xs">
                      <CryptoIcon symbol={a.symbol} size={22} />
                      <span className="flex-1 font-semibold">{ASSETS[a.symbol].name}</span>
                      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-sunken">
                        <span className="block h-full rounded-full" style={{ width: `${a.value}%`, background: ASSETS[a.symbol].color }} />
                      </span>
                      <span className="w-8 text-right font-semibold tabular-nums">{a.value}&nbsp;%</span>
                    </div>
                  ))}
                </div>
                <span className="mt-1 flex h-11 w-full items-center justify-center rounded-md bg-flash text-sm font-semibold text-on-flash">Voir mon portefeuille</span>
              </div>
            </div>
          </div>
          <FloatingGlyph name="btc" size={96} rotate={10} className="-top-8 -right-5 size-[72px] md:-top-10 md:-right-10 md:size-24" />
          <FloatingGlyph name="eth" size={80} rotate={-14} className="bottom-24 -left-6 size-16 md:-left-10 md:size-20" />
          <Coin tone="yellow" size={64} tilt={48} spin={-16} className="absolute top-10 right-10 hidden md:block" />
        </div>
      </div>

      <ol data-reveal-group className="m-0 list-none self-center p-0 md:col-span-7">
        {steps.map((s, i) => (
          <li
            key={s.n}
            className="grid grid-cols-[44px_minmax(0,1fr)] gap-x-4 gap-y-3.5 border-t border-line py-5 last:border-b md:grid-cols-[72px_minmax(0,1fr)_236px] md:items-center md:gap-6 md:py-7"
          >
            <span className="text-h1 text-flash-text md:text-display-lg">{s.n}</span>
            <div>
              <h3 className="mb-1 text-[17px] leading-6 font-bold md:text-h3 md:mb-1.5">{s.title}</h3>
              <p className="text-body-sm text-ink-muted md:text-body">{s.text}</p>
            </div>
            <div aria-hidden="true" className="col-start-2 md:col-start-auto">
              <StepVisual i={i} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- Sécurité ---------------- */
const SEC_ICONS = { id: IconId, bank: IconBuildingBank, shield: IconShieldCheck, eye: IconEye };

export function Security() {
  return (
    <section id="securite" className="mx-auto max-w-[1200px] px-3 pb-14 md:px-8 md:pb-30">
      <div className="relative grid gap-3 overflow-hidden rounded-xl bg-band px-4 pt-9 pb-4 text-on-band md:grid-cols-2 md:gap-16 md:px-16 md:py-18">
        <div data-reveal className="relative flex flex-col gap-3 md:gap-4">
          <p className="text-overline text-flash">Sécurité</p>
          <h2 className="text-h1 text-on-band md:text-display-lg">Votre argent, suivi de près</h2>
          <p className="opacity-80 md:text-body-lg md:max-w-[34ch]">
            Chaque dépôt, chaque placement et chaque retrait est visible dans votre espace, au centime près.
          </p>
          {/* Pile de pièces + bouclier */}
          <div aria-hidden="true" className="relative mt-2 h-[180px] md:mt-4 md:h-[230px]">
            {[
              { tone: "black" as const, top: "top-[84px] md:top-[104px]" },
              { tone: "yellow" as const, top: "top-[56px] md:top-[70px]" },
              { tone: "black" as const, top: "top-[28px] md:top-[36px]" },
            ].map((c, k) => (
              <div key={k} className={`absolute left-4 md:left-8 ${c.top}`}>
                <Coin tone={c.tone} size={140} tilt={64} className="origin-top-left scale-[.8] md:scale-100" />
              </div>
            ))}
            <div className="absolute top-6 left-40 grid h-[104px] w-[88px] rotate-6 place-items-center rounded-[12px_12px_44px_44px] bg-flash text-on-flash shadow-float md:top-8 md:left-[200px] md:h-[132px] md:w-[112px] md:rounded-[16px_16px_56px_56px]">
              <IconShieldCheck size={48} stroke={1.5} />
            </div>
            <Stripes count={5} height={96} className="absolute top-[100px] right-0 h-[72px] w-auto md:top-[110px] md:right-auto md:left-[340px] md:h-24" />
          </div>
        </div>

        <div data-reveal-group className="relative grid content-center gap-3 md:grid-cols-2 md:gap-6">
          {security.map((s, i) => {
            const Icon = SEC_ICONS[s.icon];
            return (
              <div key={s.title} className="relative flex gap-3.5 overflow-hidden rounded-lg border border-on-band/15 bg-on-band/6 p-4 md:flex-col md:gap-3 md:p-6">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-flash text-on-flash md:size-11">
                  <Icon size={22} {...iconProps} />
                </span>
                <div>
                  <h3 className="mb-1 text-base leading-[22px] font-bold md:text-[17px] md:leading-6">{s.title}</h3>
                  <p className="text-sm leading-5 opacity-80">{s.text}</p>
                </div>
                <span aria-hidden="true" className="absolute top-2 right-3.5 font-display text-[28px] text-on-band/12 md:text-[40px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
export async function Faq() {
  const siteConfig = await getPublicConfig();
  const faq = getFaq(siteConfig);
  return (
    <section id="faq" className="mx-auto grid max-w-[1200px] gap-3 px-4 pb-14 md:grid-cols-3 md:gap-16 md:px-8 md:pb-30">
      <div data-reveal className="relative flex flex-col gap-3 md:gap-4">
        <span aria-hidden="true" className="absolute top-[-24px] right-2 font-display text-[160px] leading-none text-flash md:hidden">
          ?
        </span>
        <p className="relative text-overline text-ink-muted">FAQ</p>
        <h2 className="relative text-h1 md:text-display-lg">Vos questions</h2>
        <p className="relative hidden text-ink-muted md:block">
          Une autre question ? Écrivez-nous depuis l&apos;app ou à{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold text-ink underline underline-offset-2">
            {siteConfig.contact.email}
          </a>
          .
        </p>
        <div aria-hidden="true" className="relative mt-2 hidden h-60 md:block">
          <span className="absolute -top-10 -left-2 font-display text-[300px] leading-none text-flash">?</span>
          <FloatingGlyph name="doge" size={88} rotate={12} className="top-28 left-[150px]" />
        </div>
      </div>
      <div className="md:col-span-2">
        {faq.map((q) => (
          <details key={q.q} className="group border-t border-line py-4 md:py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base leading-6 font-bold md:text-lg md:leading-[26px] [&::-webkit-details-marker]:hidden">
              {q.q}
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-sunken text-lg transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2.5 max-w-[60ch] text-body-sm text-ink-muted md:mt-3 md:text-body">{q.a}</p>
          </details>
        ))}
        <div className="border-t border-line" />
        <p className="mt-4 text-body-sm text-ink-muted md:hidden">
          Une autre question ? Écrivez-nous depuis l&apos;app ou à{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold text-ink underline underline-offset-2">
            {siteConfig.contact.email}
          </a>
          .
        </p>
      </div>
    </section>
  );
}

/* ---------------- Appel à l'action final ---------------- */
export function FinalCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-3 pb-10 md:px-8 md:pb-24">
      <div data-reveal className="relative flex min-h-[320px] flex-col justify-center gap-6 overflow-hidden rounded-xl bg-flash px-5 pt-9 pb-5 text-on-flash md:gap-8 md:px-16 md:py-18">
        <BoltWatermark className="-top-24 -right-28 size-[340px] md:-top-36 md:-right-16 md:size-[560px]" />
        <Image
          src="/images/nft-eth.png"
          alt=""
          aria-hidden="true"
          width={666}
          height={374}
          data-float
          className="pointer-events-none absolute top-4 -right-12 w-[200px] -rotate-6 drop-shadow-[0_18px_24px_rgba(17,17,16,.25)] md:top-1/2 md:right-16 md:-mt-28 md:w-[400px]"
        />
        <FloatingGlyph name="bnb" size={76} rotate={16} className="top-10 right-[420px] hidden md:block" />
        <h2 className="relative m-0 max-w-[8ch] font-display text-[40px] leading-10 font-normal tracking-[-0.025em] md:max-w-[12ch] md:text-[64px] md:leading-[62px]">
          Prêt à placer vos premiers euros ?
        </h2>
        <div className="relative">
          <ButtonLink href="/account/inscription" variant="band" size="lg" className="w-full md:w-auto">
            Ouvrir un compte <IconArrowRight size={20} {...iconProps} />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pied de page ---------------- */
export function SiteFooter() {
  return (
    <footer className="overflow-hidden bg-band text-on-band">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-4 pt-10 pb-8 md:gap-12 md:px-8 md:pt-16 md:pb-10">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1 md:gap-4">
            <Logo tone="dark" size={30} />
            <p className="text-sm opacity-80">Investir en crypto, sans tracas.</p>
          </div>
          <nav aria-label="Produit" className="flex flex-col gap-2.5 text-sm">
            <span className="text-overline text-flash">Produit</span>
            {navLinks.slice(0, 3).map((l) => (
              <Link key={l.href} href={l.href} className="text-on-band no-underline hover:text-flash">
                {l.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Entreprise" className="flex flex-col gap-2.5 text-sm">
            <span className="text-overline text-flash">Entreprise</span>
            <Link href="/a-propos" className="text-on-band no-underline hover:text-flash">À propos</Link>
            <Link href="/contact" className="text-on-band no-underline hover:text-flash">Contact</Link>
          </nav>
          <nav aria-label="Légal" className="flex flex-col gap-2.5 text-sm">
            <span className="text-overline text-flash">Légal</span>
            <Link href="/conditions-generales" className="text-on-band no-underline hover:text-flash">Conditions générales</Link>
            <Link href="/confidentialite" className="text-on-band no-underline hover:text-flash">Confidentialité</Link>
            <Link href="/risques" className="text-on-band no-underline hover:text-flash">Avertissement sur les risques</Link>
            <Link href="/mentions-legales" className="text-on-band no-underline hover:text-flash">Mentions légales</Link>
          </nav>
        </div>
        <p aria-hidden="true" className="m-0 font-display text-[96px] leading-[.8] tracking-[-0.04em] text-on-band/7 md:text-[200px]">
          FlashInv
        </p>
        <div className="flex flex-col gap-3 border-t border-on-band/20 pt-5 text-xs leading-[18px] opacity-75 md:flex-row md:justify-between md:gap-8 md:pt-6">
          <p className="max-w-[80ch]">
            Investir en crypto comporte un risque de perte en capital. La valeur des actifs peut baisser fortement. Les performances passées ne préjugent pas des performances futures.
          </p>
          <p className="whitespace-nowrap">© 2026 FlashInv</p>
        </div>
      </div>
    </footer>
  );
}
