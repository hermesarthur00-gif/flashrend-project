import type { Metadata, Viewport } from "next";
import { SupportChat } from "@/components/support-chat";
import { PwaRegister } from "@/components/account/pwa-register";

export const metadata: Metadata = {
  title: { default: "Mon compte", template: "%s · FlashInv" },
  manifest: "/account/manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "FlashInv", statusBarStyle: "default" },
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

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      {children}
      <PwaRegister />
      <SupportChat />
    </>
  );
}
