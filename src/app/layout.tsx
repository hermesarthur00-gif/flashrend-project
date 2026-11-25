import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteConfig } from "@/lib/site-config";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

// Batica Sans : licence d'usage personnel, licence commerciale requise avant la mise en production.
const batica = localFont({
  src: "./fonts/BaticaSans-Regular.woff2",
  variable: "--font-batica",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · Investir en crypto, sans tracas`,
    template: `%s · ${siteConfig.name}`,
  },
  description:
    `Choisissez un profil et un montant : ${siteConfig.name} répartit votre argent sur les cryptos qui vous correspondent et suit tout pour vous.`,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: siteConfig.name,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#FDD700",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" data-theme="light" className={`${satoshi.variable} ${batica.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
