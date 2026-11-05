/**
 * Informations générales du site.
 * À terme, ces valeurs viendront des réglages de l'admin (base de données).
 */
export const siteConfig = {
  name: "FlashInv",
  url: "https://flashinv.com",
  contactEmail: "contact@flashinv.com",
  legal: {
    companyName: "[RAISON SOCIALE]",
    legalForm: "[FORME JURIDIQUE]",
    address: "[ADRESSE DU SIÈGE]",
    registration: "[RCCM]",
    taxId: "[IFU]",
    director: "[DIRECTEUR DE LA PUBLICATION]",
    host: "[HÉBERGEUR ET ADRESSE]",
    lastUpdated: "5 novembre 2026",
  },
  withdrawalDelay: "[DÉLAI DE RETRAIT]",
  fees: "[FRAIS DE GESTION ET FRAIS DE RETRAIT]",
} as const;

export const navLinks = [
  { href: "/#comment", label: "Comment ça marche" },
  { href: "/#profils", label: "Profils" },
  { href: "/#securite", label: "Sécurité" },
  { href: "/#faq", label: "FAQ" },
] as const;
