import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Stripes, Coin } from "@/components/ui/decor";
import { Glyph } from "@/components/app/primitives";

export default function AuthLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-flash p-12 text-on-flash lg:flex lg:flex-col lg:justify-between">
        <Link href="/" aria-label="Retour au site FlashRend" className="relative w-fit">
          <Logo size={36} />
        </Link>
        <div className="relative max-w-[16ch]">
          <p className="text-display-lg m-0">Placez en crypto sans être expert.</p>
          <p className="text-body-lg m-0 mt-4 max-w-[34ch]">Un profil, un virement, et FlashRend s&apos;occupe de la répartition.</p>
        </div>
        <p className="relative m-0 text-sm">La valeur d&apos;un placement en crypto peut baisser. Investissez uniquement ce que vous pouvez immobiliser.</p>
        <div className="pointer-events-none absolute -right-4 bottom-24">
          <Stripes count={6} height={150} color="var(--flash-hover)" />
        </div>
        <Glyph name="btc" size={120} rotate={14} className="top-28 right-20" />
        <Glyph name="eth" size={84} rotate={-12} className="right-56 bottom-56" />
        <div className="absolute top-[46%] right-10">
          <Coin size={96} tilt={48} spin={-16} />
        </div>
      </aside>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
