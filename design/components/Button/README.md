# Button

Le bouton d'action. Une seule action `primary` (jaune) par écran : celle pour laquelle l'écran existe.

**Props** : `variant` (`primary`, `dark`, `secondary`, `ghost`, `buy`, `sell`), `size` (`sm` 36px, `md` 44px, `lg` 52px), `block` (pleine largeur), `loading`, `iconLeft`, `iconRight` (noms Tabler), plus tous les attributs de `<button>`.

- `primary` : Investir, Continuer, Déposer. Texte `on-flash` sur `flash`.
- `dark` : appel à l'action posé sur un bloc `flash` (site public) ou action forte secondaire.
- `buy` / `sell` : réservés à l'achat et à la vente d'un actif, toujours avec un libellé explicite.
- `secondary` et `ghost` : Annuler, Voir le détail, actions de second rang.
- Sur mobile, l'action principale d'un écran est `size="lg"` et `block`, collée en bas de l'écran.
- Libellés : verbe à l'infinitif, casse de phrase, sans point (« Retirer 120 $ »). Pas de flèche animée au survol.
- `loading` garde la largeur et désactive le bouton : ne remplacez pas le libellé par « Chargement ».
