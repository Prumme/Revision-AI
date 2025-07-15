export const SUBSCRIPTION_FEATURES = {
  free: ["1 quiz / jour", "10 000 tokens d'entrée par génération", "5 création de quiz maximum", "1 fichier par génération"],
  basic: [
    "20 quiz / jour",
    "20 000 tokens d'entrée par génération",
    "Pas de limite sur le nombre total de quiz",
    "5 fichiers par génération",
  ],
  pro: [
    "50 quiz / jour",
    "100 000 tokens d'entrée par génération",
    "Pas de limite sur le nombre total de quiz",
    "10 fichiers par génération",
  ],
};

export const SUBSCRIPTION_LABELS = {
  free: "GRATUIT",
  basic: "BASIC",
  pro: "PRO",
};

// Type pour les clés des abonnements
export type SubscriptionTier = keyof typeof SUBSCRIPTION_FEATURES;
