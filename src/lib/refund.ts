export const REFUND_REASONS = { MISTAKE: "Virement fait par erreur", DUPLICATE: "Dépôt en double", OTHER: "Autre raison" } as const;
export const REFUND_STATUS = {
  REQUESTED: { label: "Demandée", tone: "warning" },
  ACCEPTED: { label: "Acceptée", tone: "info" },
  REFUNDED: { label: "Remboursée", tone: "up" },
  REJECTED: { label: "Refusée", tone: "down" },
} as const;
