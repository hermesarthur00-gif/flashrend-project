# TransactionList

Historique des opérations groupé par jour.

**Props** : `items` (`[{ date, type, title?, subtitle?, amount, status? }]`, `type` : `deposit`, `withdraw`, `invest`, `gain`), `emptyText`.

- Les entrées d'argent sont précédées de + et en `up` ; les sorties de −.
- Un statut autre que `completed` affiche un StatusBadge sous le montant.
- Sans opération : état vide avec une phrase simple.
