export type SubscriptionTier = 'free' | 'basic' | 'pro';

export interface SubscriptionPolicy {
  maxTotalQuizzes: number | null;      
  maxGenerationsPerDay: number | null; 
  maxFilesPerGeneration: number;
  maxInputTokens: number;
}

export const SUBSCRIPTION_POLICIES: Record<SubscriptionTier, SubscriptionPolicy> = {
  free: {
    maxTotalQuizzes: 5,
    maxGenerationsPerDay: 1,
    maxFilesPerGeneration: 1,
    maxInputTokens: 10000,
  },
  basic: {
    maxTotalQuizzes: null,
    maxGenerationsPerDay: 20,
    maxFilesPerGeneration: 5,
    maxInputTokens: 20000,
  },
  pro: {
    maxTotalQuizzes: null,
    maxGenerationsPerDay: 50,
    maxFilesPerGeneration: 10,
    maxInputTokens: 30000,
  },
};