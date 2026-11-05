# OtpInput

Code de vérification à 6 chiffres (connexion, double authentification, validation d'un retrait).

**Props** : `length` (6), `onComplete(code)`, `error`, `label`.

- Le collage d'un code complet remplit toutes les cases ; Retour arrière revient à la case précédente.
- `autoComplete="one-time-code"` sur la première case pour le remplissage automatique par SMS.
