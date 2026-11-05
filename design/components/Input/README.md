# Input

Champ texte avec libellé, aide et message d'erreur reliés pour l'accessibilité.

**Props** : `label`, `hint`, `error` (remplace l'aide), `icon` (Tabler, à gauche), `prefix`, `suffix`, plus tous les attributs d'`<input>`.

- Texte saisi en 16px minimum (évite le zoom iOS).
- Le message d'erreur dit quoi faire : « IBAN incomplet : 27 caractères attendus. »
- Le libellé est toujours visible ; le placeholder montre un exemple, il ne remplace pas le libellé.
