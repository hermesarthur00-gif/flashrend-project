import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/sections";
import { ScrollAnimations } from "@/components/landing/scroll-animations";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <ScrollAnimations>
      <SiteHeader />
      <main className="overflow-x-clip">{children}</main>
      <SiteFooter />
    </ScrollAnimations>
  );
}
