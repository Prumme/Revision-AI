import { SUBSCRIPTION_POLICIES, SubscriptionTier } from './SubscriptionPolicy';

export class SubscriptionPolicyService {
  canCreateQuiz(tier: SubscriptionTier, totalQuizzes: number): { allowed: boolean; reason?: string } {
    const policy = SUBSCRIPTION_POLICIES[tier];
    if (policy.maxTotalQuizzes !== null && totalQuizzes >= policy.maxTotalQuizzes) {
      return { allowed: false, reason: `Limite de quiz atteinte (${policy.maxTotalQuizzes}) pour l'offre ${tier}` };
    }
    return { allowed: true };
  }

  canGenerateToday(tier: SubscriptionTier, generationsToday: number): { allowed: boolean; reason?: string } {
    const policy = SUBSCRIPTION_POLICIES[tier];
    if (policy.maxGenerationsPerDay !== null && generationsToday >= policy.maxGenerationsPerDay) {
      return { allowed: false, reason: `Limite de générations par jour atteinte (${policy.maxGenerationsPerDay}) pour l'offre ${tier}` };
    }
    return { allowed: true };
  }

  canUseFilesForGeneration(tier: SubscriptionTier, filesCount: number): { allowed: boolean; reason?: string } {
    const policy = SUBSCRIPTION_POLICIES[tier];
    if (filesCount > policy.maxFilesPerGeneration) {
      return { allowed: false, reason: `Nombre de fichiers par génération dépassé (${policy.maxFilesPerGeneration}) pour l'offre ${tier}` };
    }
    return { allowed: true };
  }

  canUseTokensForGeneration(tier: SubscriptionTier, tokensCount: number): { allowed: boolean; reason?: string } {
    const policy = SUBSCRIPTION_POLICIES[tier];
    if (tokensCount > policy.maxInputTokens) {
      return { allowed: false, reason: `Nombre de tokens d'entrée dépassé (${policy.maxInputTokens}) pour l'offre ${tier}` };
    }
    return { allowed: true };
  }
}
