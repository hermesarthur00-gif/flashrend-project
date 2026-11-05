# FlashInv

FlashInv (flashinv.com) investit l'argent de ses clients en crypto. Le client choisit un profil (prudent, équilibré ou dynamique), FlashInv répartit les fonds à sa place. Dépôts par virement en dollars ou en euros sur le compte FlashInv.

## État

- [x] Logo et design system
- [ ] Écrans : site public, app, admin
- [ ] Développement

## Design system

Tout est dans [`design/`](design/) :

- `design/README.md` : guide de marque (couleurs, typographie, ton, animations, accessibilité, intégration).
- `design/logo/` : logo en SVG et PNG, favicon, icônes d'app, image de partage.
- `design/tokens/` : `tokens.json` (source) et `tokens.css` (variables CSS, thèmes clair et sombre).
- `design/fonts/` : Batica Sans (titres) et Satoshi (texte), en woff2.
- `design/components/` : composants React de référence (`bundle.js`, `bundle.css`, `index.d.ts`) et une fiche d'usage par composant.

Version interactive : https://claude.ai/artifact/CwLeYWz8c2FBXiqD19GSMj

> Batica Sans est sous licence d'usage personnel : une licence commerciale est nécessaire avant la mise en production.

## Stack prévue

Next.js, Tailwind CSS, shadcn/ui, GSAP, Better Auth, Prisma, Neon PostgreSQL, Cloudinary. Gestionnaire de paquets : pnpm.
