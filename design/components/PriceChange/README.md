# PriceChange

Variation en pourcentage, formatée en français, avec flèche ▲ / ▼ et signe.

**Props** : `value` (nombre, ex. `-3.2`), `digits` (2 par défaut), `variant` (`soft` ajoute un fond).

- Vert `up` pour une hausse, rouge `down` pour une baisse, `ink-muted` à 0. La flèche et le signe portent l'information pour les daltoniens.
- Toujours indiquer la période à proximité (24 h, depuis le début).
