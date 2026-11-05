/**
 * Informations générales du site.
 * Ces valeurs seront gérées depuis le dashboard admin (réglages) ;
 * en attendant, elles sont définies ici.
 */
export const siteConfig = {
  name: "FlashInv",
  url: "https://flashinv.com",
  contact: {
    email: "contact@flashinv.com",
    phone: "[TÉLÉPHONE]",
    address: "[ADRESSE POSTALE]",
  },
  withdrawalDelay: "[DÉLAI DE RETRAIT]",
  fees: "[FRAIS DE GESTION ET FRAIS DE RETRAIT]",
  /** Société française : mentions légales au sens de la LCEN. */
  legal: {
    companyName: "[RAISON SOCIALE]",
    legalForm: "[FORME JURIDIQUE]",
    shareCapital: "[CAPITAL SOCIAL]",
    address: "[ADRESSE DU SIÈGE]",
    registration: "[RCS VILLE ET NUMÉRO SIREN]",
    vatNumber: "[N° DE TVA INTRACOMMUNAUTAIRE]",
    director: "[DIRECTEUR DE LA PUBLICATION]",
    host: "[HÉBERGEUR, ADRESSE ET TÉLÉPHONE]",
    lastUpdated: "5 novembre 2026",
  },
} as const;

export const navLinks = [
  { href: "/#comment", label: "Comment ça marche" },
  { href: "/#profils", label: "Profils" },
  { href: "/#securite", label: "Sécurité" },
  { href: "/#faq", label: "FAQ" },
] as const;
