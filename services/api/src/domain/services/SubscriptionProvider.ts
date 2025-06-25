import { SubscriptionTier } from '../value-objects/subscriptionTier';
import { CustomerIdentifier } from '@entities/customer.entity';
import { CustomerDto } from '@modules/subscription/dto/customer.dto';
import { StripeSubscriptionProvider } from '../../infrastructure/stripe/StripeSubscriptionProvider';
import { SubscriptionInfo } from 'domain/value-objects/subscriptionPrice';

export interface SubscriptionProvider {
  upsertCustomer(
    customerPayload: CustomerDto & { customerId?: string; email: string },
  ): Promise<CustomerIdentifier | Error>;
  getSubscriptionStatus(
    customerIdentifier: CustomerIdentifier,
  ): Promise<SubscriptionTier | Error>;
  unsubscribe(
    customerIdentifier: CustomerIdentifier,
    args?: any,
  ): Promise<true | Error>;
  subscribe(
    customerIdentifier: CustomerIdentifier,
    tier: SubscriptionTier,
    paymentMethodId: string,
  ): Promise<true | Error>;
  getStripeProductPrices(): Promise<SubscriptionInfo[] | Error>;
}

export const SubscriptionPrvProvider = {
  provide: 'SubscriptionProvider',
  useClass: StripeSubscriptionProvider,
};
