export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
}

export interface SubscriptionTierQuota {
  maxTotalQuizzes: number | null; // null = illimité
  maxGenerationsPerDay: number | null;
  maxFilesPerGeneration: number;
  maxInputTokens: number | null;
}

export const SUBSCRIPTION_TIERS_QUOTA: Record<SubscriptionTier, SubscriptionTierQuota> = {
  [SubscriptionTier.FREE]: {
    maxTotalQuizzes: 5,
    maxGenerationsPerDay: 1,
    maxFilesPerGeneration: 1,
    maxInputTokens: 2000, // à ajuster selon ta logique
  },
  [SubscriptionTier.BASIC]: {
    maxTotalQuizzes: null,
    maxGenerationsPerDay: 20,
    maxFilesPerGeneration: 5,
    maxInputTokens: 8000,
  },
  [SubscriptionTier.PRO]: {
    maxTotalQuizzes: null,
    maxGenerationsPerDay: 50,
    maxFilesPerGeneration: 10,
    maxInputTokens: 20000,
  },
};
