import { SubscriptionPolicyService } from './SubscriptionPolicyService';
import { SUBSCRIPTION_POLICIES, SubscriptionTier } from './SubscriptionPolicy';

describe('SubscriptionPolicyService', () => {
  const service = new SubscriptionPolicyService();
  const tiers: SubscriptionTier[] = ['free', 'basic', 'pro'];

  describe('canCreateQuiz', () => {
    it.each(tiers)('autorise la création si sous la limite pour %s', (tier) => {
      const policy = SUBSCRIPTION_POLICIES[tier];
      const result = service.canCreateQuiz(tier, (policy.maxTotalQuizzes ?? 10000) - 1);
      expect(result.allowed).toBe(true);
    });
    it.each(tiers)('refuse la création si à la limite pour %s', (tier) => {
      const policy = SUBSCRIPTION_POLICIES[tier];
      if (policy.maxTotalQuizzes !== null) {
        const result = service.canCreateQuiz(tier, policy.maxTotalQuizzes);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain(tier);
      }
    });
    it.each(tiers)('refuse la création si au-dessus de la limite pour %s', (tier) => {
      const policy = SUBSCRIPTION_POLICIES[tier];
      if (policy.maxTotalQuizzes !== null) {
        const result = service.canCreateQuiz(tier, policy.maxTotalQuizzes + 1);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain(tier);
      }
    });
  });

  describe('canGenerateToday', () => {
    it.each(tiers)('autorise la génération si sous la limite pour %s', (tier) => {
      const policy = SUBSCRIPTION_POLICIES[tier];
      const result = service.canGenerateToday(tier, (policy.maxGenerationsPerDay ?? 10000) - 1);
      expect(result.allowed).toBe(true);
    });
    it.each(tiers)('refuse la génération si à la limite pour %s', (tier) => {
      const policy = SUBSCRIPTION_POLICIES[tier];
      if (policy.maxGenerationsPerDay !== null) {
        const result = service.canGenerateToday(tier, policy.maxGenerationsPerDay);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain(tier);
      }
    });
    it.each(tiers)('refuse la génération si au-dessus de la limite pour %s', (tier) => {
      const policy = SUBSCRIPTION_POLICIES[tier];
      if (policy.maxGenerationsPerDay !== null) {
        const result = service.canGenerateToday(tier, policy.maxGenerationsPerDay + 1);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain(tier);
      }
    });
  });

  describe('canUseFilesForGeneration', () => {
    it.each(tiers)('autorise si sous la limite de fichiers pour %s', (tier) => {
      const policy = SUBSCRIPTION_POLICIES[tier];
      const result = service.canUseFilesForGeneration(tier, policy.maxFilesPerGeneration);
      expect(result.allowed).toBe(true);
    });
    it.each(tiers)('refuse si au-dessus de la limite de fichiers pour %s', (tier) => {
      const policy = SUBSCRIPTION_POLICIES[tier];
      const result = service.canUseFilesForGeneration(tier, policy.maxFilesPerGeneration + 1);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain(tier);
    });
  });

  describe('canUseTokensForGeneration', () => {
    it.each(tiers)('autorise si sous la limite de tokens pour %s', (tier) => {
      const policy = SUBSCRIPTION_POLICIES[tier];
      const result = service.canUseTokensForGeneration(tier, policy.maxInputTokens - 1);
      expect(result.allowed).toBe(true);
    });
    it.each(tiers)('refuse si au-dessus de la limite de tokens pour %s', (tier) => {
      const policy = SUBSCRIPTION_POLICIES[tier];
      const result = service.canUseTokensForGeneration(tier, policy.maxInputTokens + 1);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain(tier);
    });
  });
});
