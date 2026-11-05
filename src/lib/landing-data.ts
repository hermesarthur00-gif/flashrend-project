export type CryptoSymbol = "BTC" | "ETH" | "BNB" | "DOGE" | "USDT" | "SOL";

export type ProfileId = "careful" | "balanced" | "bold";

export const profiles: Record<
  ProfileId,
  { label: string; risk: number; text: string; allocation: { symbol: CryptoSymbol; value: number }[] }
> = {
  careful: {
    label: "Prudent",
    risk: 2,
    text: "Pour découvrir la crypto en limitant les secousses. Une large part reste en stablecoin, indexé sur le dollar.",
    allocation: [
      { symbol: "USDT", value: 60 },
      { symbol: "BTC", value: 30 },
      { symbol: "ETH", value: 10 },
    ],
  },
  balanced: {
    label: "Équilibré",
    risk: 3,
    text: "Le bon compromis : les grandes cryptos au cœur du portefeuille, une réserve en stablecoin pour amortir les baisses.",
    allocation: [
      { symbol: "BTC", value: 45 },
      { symbol: "ETH", value: 25 },
      { symbol: "USDT", value: 20 },
      { symbol: "SOL", value: 10 },
    ],
  },
  bold: {
    label: "Dynamique",
    risk: 5,
    text: "Pour viser plus haut en acceptant de fortes variations, à la hausse comme à la baisse.",
    allocation: [
      { symbol: "BTC", value: 40 },
      { symbol: "ETH", value: 30 },
      { symbol: "SOL", value: 20 },
      { symbol: "BNB", value: 10 },
    ],
  },
};

// Cours indicatifs : à remplacer par une source de prix en temps réel.
export const ticker: { symbol: CryptoSymbol; name: string; price: number; change: number }[] = [
  { symbol: "BTC", name: "Bitcoin", price: 71924.73, change: 2.41 },
  { symbol: "ETH", name: "Ethereum", price: 3368.4, change: -1.18 },
  { symbol: "SOL", name: "Solana", price: 184.48, change: 5.02 },
  { symbol: "BNB", name: "BNB", price: 612.3, change: 0.84 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.1642, change: -2.1 },
  { symbol: "USDT", name: "Tether", price: 1, change: 0 },
];

export const steps = [
  {
    n: "01",
    title: "Créez votre compte",
    text: "Vérification d'identité en ligne : une pièce d'identité et un selfie.",
  },
  {
    n: "02",
    title: "Choisissez votre profil",
    text: "Prudent, équilibré ou dynamique, selon le risque que vous acceptez. Vous pouvez en changer plus tard.",
  },
  {
    n: "03",
    title: "Faites un virement",
    text: "En dollars ou en euros, sur le compte FlashInv. Vos fonds sont placés dès réception.",
  },
] as const;

export const security = [
  { icon: "id", title: "Identité vérifiée", text: "Chaque compte est vérifié avant le premier dépôt." },
  {
    icon: "bank",
    title: "Virements tracés",
    text: "Vous déposez sur un compte au nom de FlashInv. Chaque mouvement apparaît dans votre historique.",
  },
  { icon: "shield", title: "Double authentification", text: "Un code est demandé à la connexion et pour chaque retrait." },
  { icon: "eye", title: "Tout est visible", text: "Solde, répartition et frais en temps réel dans l'app." },
] as const;

export const getFaq = (siteConfig: { withdrawalDelay: string; fees: string }) => [
  {
    q: "Faut-il s'y connaître en crypto ?",
    a: "Non. Vous choisissez un profil, FlashInv s'occupe de la répartition et des ajustements. Vous suivez l'évolution depuis l'app.",
  },
  {
    q: "Comment déposer de l'argent ?",
    a: "Par virement bancaire, en dollars ou en euros, sur le compte FlashInv indiqué dans votre espace, avec votre référence personnelle. Les fonds sont placés à réception.",
  },
  {
    q: "Puis-je retirer mon argent quand je veux ?",
    a: `Oui, depuis l'app. Le retrait est envoyé par virement sur votre compte bancaire sous ${siteConfig.withdrawalDelay}.`,
  },
  {
    q: "Combien coûte FlashInv ?",
    a: `${siteConfig.fees}. Tous les frais sont affichés dans l'app avant chaque opération.`,
  },
  {
    q: "Est-ce risqué ?",
    a: "Oui. La valeur des cryptos varie fortement et peut baisser. Choisissez un profil adapté et n'investissez que de l'argent dont vous n'avez pas besoin à court terme.",
  },
];
