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

Créez ensuite votre compte sur `/account/inscription`, confirmez votre e-mail, puis donnez-lui le rôle administrateur (une seule fois) :

```bash
pnpm admin:promote vous@exemple.com
```

Les autres rôles, bannissements et suppressions se gèrent ensuite dans l'admin, depuis la fiche de chaque utilisateur.

Sans `RESEND_API_KEY`, les e-mails (dont les codes de vérification) s'affichent dans la console du serveur.

### Organisation

- `/` et pages publiques : `src/app/(public)`. Contact, mentions légales, frais et délais viennent des réglages de l'admin.
- `/account` : espace client (PWA, portée `/account/`). Connexion, inscription, confirmation de l'e-mail, code à chaque connexion, vérification d'identité, choix du profil, accueil, portefeuille, dépôt, retrait (code par e-mail), activité, notifications, réglages, comptes bancaires.
- `/admin` : tableau de bord, clients, vérifications d'identité, rapprochement des dépôts, envoi des retraits, répartition des profils et rééquilibrage, réglages (société, coordonnées bancaires confirmées par code, frais et délais, contact, équipe), journal.
- `src/lib/server/` : base (`db.ts`), authentification Better Auth (`auth.ts`), réglages, cours CoinGecko, logique de portefeuille, notifications (base + Web Push + e-mail), codes de confirmation, pièces d'identité (Cloudinary).
- `prisma/schema.prisma` et `prisma/seed.ts`.
- `public/account/` : manifeste, service worker, icônes et page hors ligne de la PWA.

### Fonctionnement

- **Dépôt** : le client choisit virement classique ou instantané (délais réglables dans l'admin), fait le virement, puis déclare le montant avec la preuve. Les admins reçoivent un e-mail ; un admin vérifie la réception, corrige le montant si besoin (et le taux EUR → USD), puis crédite ou refuse. Le **solde disponible** du client, tenu en dollars, est crédité.
- **Investissement** : le client investit tout ou partie de son solde disponible ; le montant est réparti selon son profil, aux cours en direct. **Désinvestir** revend un montant (proportionnellement sur chaque crypto) vers le solde disponible.
- **Retrait** : depuis le solde disponible uniquement, confirmé par un code envoyé par e-mail. L'admin envoie le virement et le marque comme envoyé ; un retrait refusé est rendu au solde disponible.
- **Temps réel** : les cours viennent du flux public de Binance (chaque seconde, sans clé), avec CoinGecko puis les derniers cours connus en secours. Les courbes 24 h sont reconstituées à partir des cours ; 7 j, 1 m et 3 m s'appuient sur le relevé quotidien des portefeuilles.
- **Rééquilibrage** : en modifiant la répartition d'un profil, l'admin peut rééquilibrer tous les portefeuilles concernés. Un changement de profil par le client rééquilibre ses investissements.
- **Migrations** : `pnpm build` applique les migrations Prisma (`prisma migrate deploy`) avant le build, donc à chaque déploiement Vercel. Si `DATABASE_URL` passe par le pooler Neon, ajoutez `DIRECT_URL` (connexion directe) pour les migrations.
- **Tâche planifiée** : `vercel.json` appelle `/api/cron/prices` chaque jour (avec `CRON_SECRET`) pour mettre à jour les cours et enregistrer la valeur quotidienne des portefeuilles.
