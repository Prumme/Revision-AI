export const SUBSCRIPTION_FEATURES = {
  free: ["1 quiz / jour", "Fichier max 10 Mo", "Pas de rappel intelligent", "Historique limité"],
  basic: [
    "Quiz illimités",
    "Taille fichier étendue (jusqu'à 50 Mo)",
    "Rappels intelligents",
    "Suivi de progression détaillé",
    "Génération par thème / niveau",
  ],
  pro: [
    "Tout dans l'offre Basic",
    "Analyse avancée des cours",
    "Mode Révision Express",
    "Création de sessions de révision intelligentes",
    "Assistance prioritaire",
  ],
};

export const SUBSCRIPTION_LABELS = {
  free: "GRATUIT",
  basic: "BASIC",
  pro: "PRO",
};

// Type pour les clés des abonnements
export type SubscriptionTier = keyof typeof SUBSCRIPTION_FEATURES;
