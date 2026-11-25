import type { Metadata, Viewport } from "next";
import { SupportChat } from "@/components/support-chat";
import { Suspense } from "react";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { getSession } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { PwaRegister } from "@/components/account/pwa-register";

export const metadata: Metadata = {
  title: { default: "Mon compte", template: "%s · FlashRend" },
  manifest: "/account/manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "FlashRend", statusBarStyle: "default" },
  icons: { apple: "/account/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F4EC" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
  viewportFit: "cover",
};

// Thème choisi dans les réglages (clair, sombre ou système), appliqué avant l'affichage.
const themeScript = `try{var t=localStorage.getItem("fi-theme")||"light";if(t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

/** Visible seulement pour un administrateur : rappelle qu'il est dans l'espace client et ramène à l'admin. */
async function AdminReturnBar() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") return null;
  return (
    <div className="bg-band text-on-band">
      <div className="mx-auto flex h-10 max-w-[1240px] items-center justify-between gap-3 px-4 text-sm">
        <span className="truncate text-on-band/80">Vous voyez l&apos;espace client</span>
        <Link href="/admin" className="group inline-flex shrink-0 items-center gap-1.5 font-semibold text-flash">
          <IconArrowLeft size={16} stroke={2} className="transition-transform duration-300 group-hover:-translate-x-1" /> Retour à l&apos;administration
        </Link>
      </div>
    </div>
  );
}

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <Suspense fallback={null}>
        <AdminReturnBar />
      </Suspense>
      {children}
      <PwaRegister />
      <SupportChat />
    </>
  );
}
