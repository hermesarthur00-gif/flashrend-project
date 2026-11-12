/**
 * Informations fixes du site.
 * Contact, mentions légales, coordonnées bancaires, frais et délais sont gérés
 * dans l'admin (Réglages) : voir src/lib/server/settings.ts.
 */
export const siteConfig = {
  name: "FlashInv",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.flashinv.com",
  contact: { email: "contact@flashinv.com" },
  legal: { lastUpdated: "5 novembre 2026" },
} as const;

export const navLinks = [
  { href: "/#comment", label: "Comment ça marche" },
  { href: "/#profils", label: "Profils" },
  { href: "/#securite", label: "Sécurité" },
  { href: "/#faq", label: "FAQ" },
] as const;
