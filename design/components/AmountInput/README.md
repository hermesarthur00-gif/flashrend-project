# AmountInput

Saisie d'un montant en USD, en grand, avec montants rapides et contrôle du solde.

**Props** : `label`, `value` / `defaultValue`, `onChange(string)`, `min`, `max` (solde disponible), `quick` (tableau de montants, `[50, 100, 250, 500]` par défaut), `hint`.

- Écran Investir et Retirer : un seul AmountInput par écran, suivi d'un Button `primary` `block`.
- Le clavier décimal s'ouvre sur mobile (`inputMode="decimal"`).
- Les erreurs (au-dessus du solde, sous le minimum) s'affichent sous le champ, sans bloquer la saisie.
