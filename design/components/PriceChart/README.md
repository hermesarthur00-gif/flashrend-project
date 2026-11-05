# PriceChart

Courbe de prix avec périodes, prix et variation qui suivent le doigt ou la souris.

**Props** : `series` (`{ '24 h': number[], '7 j': number[], … }`), `ranges` (ordre des onglets), `defaultRange`, `height` (200), `label`.

- Pas d'axes ni de grille : le prix survolé s'affiche dans l'en-tête.
- Aire sous la courbe en aplat à 12 % d'opacité, sans dégradé.
- La courbe se dessine à l'apparition (0,7 s), sauf si l'utilisateur a réduit les animations.
