import { Hero } from "@/components/landing/hero";
import { Profiles } from "@/components/landing/profiles";
import { Faq, FinalCta, HowItWorks, Security, Ticker } from "@/components/landing/sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <HowItWorks />
      <Profiles />
      <Security />
      <Faq />
      <FinalCta />
    </>
  );
}
