import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Profiles } from "@/components/landing/profiles";
import { Faq, FinalCta, HowItWorks, Security, SiteFooter, Ticker } from "@/components/landing/sections";
import { ScrollAnimations } from "@/components/landing/scroll-animations";

export default function Home() {
  return (
    <ScrollAnimations>
      <SiteHeader />
      <main className="overflow-x-clip">
        <Hero />
        <Ticker />
        <HowItWorks />
        <Profiles />
        <Security />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </ScrollAnimations>
  );
}
