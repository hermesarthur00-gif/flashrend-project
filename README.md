# FlashInv

FlashInv (flashinv.com) investit l'argent de ses clients en crypto. Le client choisit un profil (prudent, équilibré ou dynamique), FlashInv répartit les fonds à sa place. Dépôts par virement en dollars ou en euros sur le compte FlashInv.

## État

- [x] Logo et design system
- [x] Écrans du site public
- [x] Développement du site public
- [x] Écrans : app, admin
- [x] Développement : app (PWA sous `/account`) et admin (`/admin`)

## Design system

Tout est dans [`design/`](design/) :

- `design/README.md` : guide de marque (couleurs, typographie, ton, animations, accessibilité, intégration).
- `design/logo/` : logo en SVG et PNG, favicon, icônes d'app, image de partage.
- `design/tokens/` : `tokens.json` (source) et `tokens.css` (variables CSS, thèmes clair et sombre).
- `design/fonts/` : Batica Sans (titres) et Satoshi (texte), en woff2.
- `design/components/` : composants React de référence (`bundle.js`, `bundle.css`, `index.d.ts`) et une fiche d'usage par composant.

Version interactive : https://claude.ai/artifact/CwLeYWz8c2FBXiqD19GSMj

> Batica Sans est sous licence d'usage personnel : une licence commerciale est nécessaire avant la mise en production.

## Stack

Next.js, Tailwind CSS, shadcn/ui, GSAP, Better Auth, Prisma, Neon PostgreSQL, Cloudinary. Gestionnaire de paquets : pnpm.

- **E-mails** (contact et transactionnels) : Resend.
- **Notifications internes** : Sonner (composant shadcn/ui).
- **Notifications de l'app** : Web Push (PWA).

## Développement

```bash
pnpm install                 # génère aussi le client Prisma
cp .env.example .env.local   # puis renseignez les variables
pnpm db:migrate              # crée les tables (première fois : --name init)
pnpm db:seed                 # cryptos, répartitions des profils, réglages par défaut
pnpm dev                     # http://localhost:3000
pnpm build
pnpm lint
```

Créez ensuite votre compte sur `/account/inscription` avec une adresse listée dans `ADMIN_EMAILS` : il reçoit le rôle administrateur et accède à `/admin`.

Sans `RESEND_API_KEY`, les e-mails (dont les codes de vérification) s'affichent dans la console du serveur.

### Organisation

- `/` et pages publiques : `src/app/(public)`. Contact, mentions légales, frais et délais viennent des réglages de l'admin.
- `/account` : espace client (PWA, portée `/account/`). Connexion, inscription, confirmation de l'e-mail, code à chaque connexion, vérification d'identité, choix du profil, accueil, portefeuille, dépôt, retrait (code par e-mail), activité, notifications, réglages, comptes bancaires.
- `/admin` : tableau de bord, clients, vérifications d'identité, rapprochement des dépôts, envoi des retraits, répartition des profils et rééquilibrage, réglages (société, coordonnées bancaires confirmées par code, frais et délais, contact, équipe), journal.
- `src/lib/server/` : base (`db.ts`), authentification Better Auth (`auth.ts`), réglages, cours CoinGecko, logique de portefeuille, notifications (base + Web Push + e-mail), codes de confirmation, pièces d'identité (Cloudinary).
- `prisma/schema.prisma` et `prisma/seed.ts`.
- `public/account/` : manifeste, service worker, icônes et page hors ligne de la PWA.

### Fonctionnement

- **Valorisation** : chaque client détient des quantités de cryptos. La valeur affichée vaut quantité × cours CoinGecko (rafraîchi toutes les 2 minutes au plus, dernier cours connu conservé en cas d'indisponibilité).
- **Dépôt** : le client annonce son virement, l'admin saisit le montant reçu (et le taux EUR → USD pour un virement en euros). Le montant est réparti selon le profil du client, aux cours du moment.
- **Retrait** : confirmé par un code envoyé par e-mail. Le montant et les frais sont vendus proportionnellement sur chaque ligne, puis l'admin envoie le virement et le marque comme envoyé. Un retrait refusé est replacé sur le profil.
- **Rééquilibrage** : en modifiant la répartition d'un profil, l'admin peut rééquilibrer tous les portefeuilles concernés. Un changement de profil par le client rééquilibre son portefeuille.
- **Tâche planifiée** : `vercel.json` appelle `/api/cron/prices` chaque jour (avec `CRON_SECRET`) pour mettre à jour les cours et enregistrer la valeur quotidienne des portefeuilles.
