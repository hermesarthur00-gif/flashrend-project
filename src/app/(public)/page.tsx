import { Hero } from "@/components/landing/hero";
import { Profiles } from "@/components/landing/profiles";
import { Faq, FinalCta, HowItWorks, Security, Ticker } from "@/components/landing/sections";
import { getPublicAllocations } from "@/lib/server/public-config";

export default async function Home() {
  const allocations = await getPublicAllocations();
  return (
    <>
      <Hero />
      <Ticker />
      <HowItWorks />
      <Profiles allocations={allocations} />
      <Security />
      <Faq />
      <FinalCta />
    </>
  );
}
