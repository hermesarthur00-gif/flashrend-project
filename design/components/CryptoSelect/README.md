# CryptoSelect

Sélecteur d'actif : déclencheur avec pastille, liste déroulante avec variation 24 h.

**Props** : `items` (`[{ symbol, name, change? }]`), `value` / `defaultValue`, `onChange(symbol)`, `label`.

- Plus de 8 actifs : remplacez la liste par une Modal plein écran avec recherche (`Input` + `AssetRow`).
