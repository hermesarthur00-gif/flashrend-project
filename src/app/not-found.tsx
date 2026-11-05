import Link from "next/link";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/sections";
import { buttonVariants } from "@/components/ui/button";
import { BoltWatermark, FloatingGlyph } from "@/components/ui/decor";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-3 pt-1 pb-16 md:px-8 md:pt-2 md:pb-24">
        <div className="relative flex min-h-[460px] flex-col justify-end gap-6 overflow-hidden rounded-xl bg-flash px-5 py-10 text-on-flash md:min-h-[520px] md:px-16 md:py-16">
          <BoltWatermark className="-top-20 -right-24 size-[380px] md:-top-32 md:right-10 md:size-[560px]" />
          <FloatingGlyph name="doge" size={110} rotate={14} className="top-8 right-8 size-20 md:top-16 md:right-40 md:size-28" />
          <p aria-hidden="true" className="relative m-0 font-display text-[120px] leading-[.85] tracking-[-0.04em] md:text-[220px]">404</p>
          <h1 className="relative m-0 max-w-[16ch] font-display text-[32px] leading-9 font-normal md:text-[48px] md:leading-[50px]">Cette page s&apos;est envolée.</h1>
          <p className="relative m-0 max-w-[40ch]">Le lien est peut-être ancien ou mal copié. Revenez à l&apos;accueil pour continuer.</p>
          <Link href="/" className={buttonVariants({ variant: "band", size: "lg", className: "relative self-start" })}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
