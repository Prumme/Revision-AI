import { SubscriptionTier } from '../value-objects/subscriptionTier';
import { User } from '@entities/user.entity';

export interface CustomerIdentifier {
  customerId: string;
}
export interface Customer extends CustomerIdentifier {
  firstName: string;
  lastName: string;
  subscriptionTier: SubscriptionTier;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export type CustomerAndUser = Customer & User;
