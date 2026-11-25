import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";
import { Logo } from "@/components/ui/logo";
import { Stripes } from "@/components/ui/decor";
import { Glyph } from "@/components/app/primitives";

/** Bandeau jaune en haut des écrans d'accès (mobile). */
export function AuthBand({ title, sub, glyph = "btc" }: { title: string; sub: string; glyph?: "btc" | "eth" }) {
  return (
    <div className="relative mx-3 mt-2 flex flex-col gap-3.5 overflow-hidden rounded-xl bg-flash px-5 pt-6 pb-7 text-on-flash lg:hidden">
      <div className="pointer-events-none absolute -right-1.5 -bottom-2">
        <Stripes count={5} height={96} color="var(--flash-hover)" />
      </div>
      <Glyph name={glyph} size={64} rotate={14} className="top-4 right-5" />
      <Link href="/" aria-label="Retour au site FlashRend" className="relative w-fit">
        <Logo size={28} />
      </Link>
      <div className="relative">
        <h1 className="text-display-lg m-0 max-w-[10ch] text-[34px] leading-9">{title}</h1>
        <p className="m-0 mt-2 max-w-[30ch] text-[15px] leading-[22px]">{sub}</p>
      </div>
    </div>
  );
}

export function AuthBack({ href }: { href: string }) {
  return (
    <div className="flex h-14 items-center px-2">
      <Link href={href} aria-label="Retour" className="grid size-11 place-items-center rounded-md hover:bg-ink/8">
        <IconChevronLeft size={22} stroke={1.75} />
      </Link>
    </div>
  );
}

/** Colonne de formulaire centrée sur grand écran. */
export function AuthBody({ children, title, sub }: { children: React.ReactNode; title?: string; sub?: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col gap-5 px-4 pt-6 pb-6 lg:justify-center lg:py-16">
      {title && (
        <div className={sub === undefined ? "hidden lg:block" : undefined}>
          <h1 className="text-h2 m-0 lg:text-h1">{title}</h1>
          {sub && <p className="m-0 mt-2 text-ink-muted">{sub}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function maskEmail(email: string) {
  const [u, d] = email.split("@");
  if (!d) return email;
  return `${u.slice(0, 1)}••••@${d}`;
}
