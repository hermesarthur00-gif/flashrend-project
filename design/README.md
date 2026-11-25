FlashRend place l'argent de ses clients sur des placements crypto. Le public : des débutants et toute personne qui veut investir sans se prendre la tête. Le système sert deux surfaces : le **site public** (énergique, grands blocs jaunes et noirs, animations au scroll) et l'**app** (web mobile first, calme, peu de données à la fois).

## Principes

1. **Une chose à la fois.** Un écran = une décision. Une carte = une information principale. Une seule action `primary` jaune par écran.
2. **Le jaune, c'est l'action et la marque.** `flash` sert aux boutons principaux, aux grands blocs du site et aux éléments actifs. Jamais pour du texte sur fond clair.
3. **Des chiffres qu'on comprend.** Montants en dollars d'abord, en crypto ensuite. Toujours la période à côté d'une variation.
4. **Énergique sur le site, posé dans l'app.** Le site ose les titres géants et le mouvement ; l'app reste sobre et lisible.

## Ton et contenu

- Langue : français uniquement. Vouvoiement partout (« Vous choisissez un montant »).
- Phrases courtes, mots du quotidien. On écrit « placer », « retirer », « gains », pas « allocation », « liquidité », « PnL ».
- Boutons : verbe à l'infinitif, casse de phrase, sans point : « Investir », « Retirer 120 $ », « Ouvrir un compte ».
- Titres en casse de phrase, sans point final. Pas de point d'exclamation dans l'app.
- Montants au format français avec le symbole après : `12 480,36 $` (espace insécable avant `$`). Variations : `+18,25 %`, `−3,20 %` (vrai signe moins). Utilisez `formatUSD`, `formatPct`, `formatCrypto` du bundle.
- Dates relatives dans l'app (« Aujourd'hui », « 3 novembre »), heures sur 24 h (« 14:32 »).
- Messages d'erreur : ce qui se passe, puis quoi faire. « Votre banque a rejeté le virement. Vérifiez votre IBAN. »
- Pas d'emoji, ni dans les titres, ni en tête de liste. Pas de tiret cadratin dans les textes visibles. Pas de tournure « ce n'est pas X, c'est Y ».
- Risque : chaque écran de placement rappelle en `caption` que la valeur des cryptos peut baisser.

## Couleurs

- Fond de page : `surface` (blanc cassé chaud en clair, noir chaud en sombre). **Jamais de blanc pur** en fond de page. Cartes et champs : `surface-raised`. Zones en retrait : `surface-sunken`.
- Texte : `ink` pour le principal, `ink-muted` pour le secondaire. Les deux tiennent 4.5:1 sur `surface`, `surface-raised` et `surface-sunken` dans les deux thèmes.
- Marque : `flash` (#FDD700), texte dessus toujours `on-flash`. Pour du texte jaune lisible (lien de marque, badge), utilisez `flash-text`, et `flash-soft` comme fond doux.
- Bandes noires du site et carte de solde : `band`, texte dessus `on-band` ou `flash`.
- Hausse / gain / succès : `up` (texte), `up-soft` (fond), `up-fill` + `on-up` (bouton Acheter). Baisse / perte / erreur : `down`, `down-soft`, `down-fill` + `on-down`. Vert et rouge classiques, **toujours accompagnés de ▲ / ▼, d'un signe ou d'une icône** pour les personnes daltoniennes.
- Avertissement : `warning` / `warning-soft`. Information et liens dans le texte : `info` / `info-soft`.
- Cryptos : `crypto-btc`, `crypto-eth`, `crypto-bnb`, `crypto-doge`, `crypto-usdt`, `crypto-sol` sont les couleurs officielles des marques. Elles ne servent qu'aux pastilles d'actifs et au graphique de répartition.
- Thème sombre : mêmes rôles, valeurs ajustées. Le jaune `flash` ne change pas. Le logo passe automatiquement en carré jaune et éclair noir.
- Pas de dégradé, pas de couleur néon, pas de violet de décoration.

## Typographie

- **Batica Sans** (`display`) pour les titres : `display-xl`, `display-lg`, `h1`, `h2`, `h3`. Une seule graisse (Regular), lettres resserrées (`letterSpacing` négatif). Titres du site très grands, sur deux lignes maximum.
- **Satoshi** (`sans`, variable 300 à 900) pour tout le reste : `body-lg`, `body`, `body-sm`, `label`, `caption`, `overline`.
- Montants : `amount-xl` (solde total), `amount-lg` (montant saisi, prix en détail), `amount` (listes), `amount-sm` (variations), toujours en chiffres tabulaires (`font-variant-numeric: tabular-nums`).
- Texte des champs en 16px minimum. Corps de texte en `body` (16/24).
- Mobile : `display-xl` devient `display-lg`, `h1` devient `h2`.
- **Licence** : Batica Sans est fournie sous licence d'usage personnel. Une licence commerciale de l'auteur est obligatoire avant la mise en production du site et du logo.

## Espacements, rayons, ombres

- Grille de 4px : `space-1` (4) à `space-24` (96). Marge latérale mobile `space-4`, padding des cartes `space-4` (mobile) / `space-5` (desktop), écart entre cartes `space-6`, sections du site `space-12` (mobile) / `space-16` (desktop).
- Arrondis légers : `radius-md` (8px) par défaut pour boutons et champs, `radius-lg` (12px) pour cartes et modales, `radius-xs` pour badges. `radius-xl` (20px) uniquement pour les grands blocs jaunes ou noirs du site public. `radius-full` pour pastilles et interrupteurs seulement.
- **Bordures plutôt qu'ombres** : `line` pour séparer, `line-strong` pour le contour des contrôles (3:1). Deux ombres en tout : `shadow-float` (cartes flottantes et objets 3D du site public) et `shadow-overlay` (modales, menus, toasts). Aucune ombre sur les cartes de l'app.
- Hauteurs de contrôles : `control-sm` 36, `control-md` 44 (défaut), `control-lg` 52 (action principale mobile).

## Mise en page

- Mobile first, conçu à 390px. L'app tient dans une colonne de `container-app` (560px) centrée sur desktop ; le site public dans `container` (1200px).
- App mobile : `TopBar` en haut, `BottomNav` en bas (5 entrées, Investir au centre en jaune), action principale `Button size="lg" block` collée au-dessus de la navigation.
- Accueil de l'app : `BalanceCard`, puis la liste des actifs (`AssetRow`), puis l'activité récente (`TransactionList`, 3 lignes). Pas de tableau de bord chargé, pas de chiffres décoratifs.
- Site public : alternance de blocs `flash` et de bandes `band` aux grands rayons, comme dans `HeroBlock`. Évitez les grilles de trois cartes identiques et les grilles bento ; préférez des sections en deux colonnes texte / visuel ou des démonstrations réelles de l'app (captures, vidéo courte).

## Mouvement

- **Site public (GSAP + ScrollTrigger)** : entrées orchestrées au scroll. Titres en Batica qui montent ligne par ligne (`y: 40 → 0`, `opacity`, 0,6 s, `power3.out`, décalage 0,08 s), cartes de cours et pièces 3D qui flottent légèrement en parallaxe, chiffres qui défilent jusqu'à leur valeur. Une séquence par section, déclenchée à 75 % de la hauteur de l'écran, jouée une seule fois.
- **App** : micro-animations seulement, 150 à 300 ms. Pression des boutons (`scale(.98)`), glissement de l'interrupteur, montée des feuilles, entrée des toasts, tracé de la courbe de prix. Pas d'animation au survol qui déplace les éléments.
- `prefers-reduced-motion` : toutes les animations sont coupées (déjà géré dans `bundle.css` ; à faire aussi dans les timelines GSAP avec `gsap.matchMedia()`).

## États et accessibilité

- Focus clavier : anneau `focus` de 2px plein, décalé de 2px (`outline: 2px solid var(--focus); outline-offset: 2px`). Noir en clair, jaune en sombre.
- Survol : changement de fond (`surface-sunken`, `flash-hover`), jamais de déplacement.
- Désactivé : opacité 45 %, curseur interdit. Chargement : `loading` sur le bouton, `Skeleton` pour les contenus.
- Cibles tactiles de 44px minimum. Contraste WCAG AA vérifié sur toutes les paires de texte des tokens, dans les deux thèmes.

## Iconographie

- **Tabler Icons** en contour (`@tabler/icons-react`), épaisseur 1,75, tailles 16 / 20 / 24. Le composant `Icon` du bundle embarque le jeu utilisé par les composants.
- Pas d'icônes Lucide, pas d'emoji, pas d'icône « étincelles », pas de puces à coche répétées dans les listes marketing.
- Pastilles d'actifs : `CryptoIcon`. En production, passez les logos officiels des cryptos via `src`.

## Illustrations

- Rendus **3D** : pièces noires et jaunes, objets qui flottent autour des blocs jaunes du site, avec `shadow-float`. Le buste fourni dans les assets est une illustration ponctuelle, pas un élément d'identité.
- Pas d'orbes lumineux flous, pas de trames de points, pas d'effet verre dépoli, pas de fausse fenêtre de terminal.
- Témoignages : vraies photos de clients ou pas de photo ; jamais d'avatars génériques.

## Logo

- Fichiers dans le groupe d'assets **Logos**. Symbole : carré noir aux coins continus, éclair jaune en forme de flèche montante. Sur fond sombre : carré jaune, éclair noir.
- Dans le code, utilisez le composant `Logo` (`tone="auto"` suit le thème).
- Zone de protection : la moitié de la hauteur du symbole. Taille minimale : 20px de haut pour le symbole, 24px pour la version horizontale.
- Ne pas recolorer, étirer, ajouter d'ombre ni poser le carré noir sur un fond sombre.

## Dans le code (Next.js, Tailwind, shadcn/ui)

- Copiez les variables de `tokens.css` dans `app/globals.css`. Le thème sombre passe par `[data-theme="dark"]` (ou la classe `.dark` si vous utilisez `next-themes` avec `attribute="class"` : renommez le sélecteur).
- Tailwind v4 : exposez les tokens dans `@theme inline` (`--color-flash: var(--flash);`, `--color-surface: var(--surface);`, `--font-display: var(--font-display);`, `--radius-lg: var(--radius-lg);` …) pour écrire `bg-flash text-on-flash rounded-lg`.
- shadcn/ui : branchez ses variables sur les nôtres : `--background: var(--surface)`, `--foreground: var(--ink)`, `--card: var(--surface-raised)`, `--primary: var(--flash)`, `--primary-foreground: var(--on-flash)`, `--secondary: var(--surface-sunken)`, `--muted-foreground: var(--ink-muted)`, `--destructive: var(--down-fill)`, `--border: var(--line)`, `--input: var(--line-strong)`, `--ring: var(--focus)`, `--radius: 0.5rem`.
- Polices : `next/font/local` avec `fonts/BaticaSans-Regular.woff2` et `fonts/Satoshi-Variable.woff2`, exposées en `--font-display` et `--font-sans`.
- Les composants du bundle (`window.FlashRend`) sont la référence visuelle et comportementale : reprenez leurs classes `fi-*` de `components/bundle.css` ou recréez-les en composants React/shadcn avec les mêmes tokens.
