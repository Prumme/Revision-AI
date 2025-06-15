import { SubscriptionTier } from '../../domain/value-objects/subscriptionTier';

export const StripeSubscriptionDict: Record<string, SubscriptionTier> = {
  prod_ST2Ewwxr4l2tTg: SubscriptionTier.BASIC,
  prod_ST2E8JasHxTmG3: SubscriptionTier.PRO,
};

export const StripeSubscriptionDictReverse: Record<SubscriptionTier, string> = {
  [SubscriptionTier.BASIC]: 'prod_ST2Ewwxr4l2tTg',
  [SubscriptionTier.PRO]: 'prod_ST2E8JasHxTmG3',
  [SubscriptionTier.FREE]: null,
};
