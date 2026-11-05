# FlashInv

FlashInv (flashinv.com) investit l'argent de ses clients en crypto. Le client choisit un profil (prudent, équilibré ou dynamique), FlashInv répartit les fonds à sa place. Dépôts par virement en dollars ou en euros sur le compte FlashInv.

## État

- [x] Logo et design system
- [x] Écrans du site public
- [x] Développement du site public
- [ ] Écrans : app, admin
- [ ] Développement : app, admin

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

- **E-mails** (contact et transactionnels) : Resend.
- **Notifications internes** : Sonner (composant shadcn/ui).
- **Notifications de l'app** : Web Push (PWA).

## Développement

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build de production
pnpm lint
```

Copiez `.env.example` en `.env.local` et renseignez `RESEND_API_KEY`, `EMAIL_FROM` et `CONTACT_TO_EMAIL` pour activer le formulaire de contact.

- `src/app/globals.css` : tokens du design system (thèmes clair et sombre), mapping Tailwind (`bg-flash`, `text-ink`, `rounded-lg`…) et variables shadcn/ui.
- `src/lib/site-config.ts` : coordonnées (e-mail, téléphone, adresse), mentions légales, délais et frais. Ces valeurs seront gérées dans le dashboard admin.
- `src/lib/landing-data.ts` : contenus de la landing (profils, étapes, FAQ, cours indicatifs).
- `src/components/ui/` : logo, boutons, éléments financiers, décors (pièces, barres, éclair).
- `src/components/landing/` : sections de la page d'accueil et animations GSAP au scroll.
