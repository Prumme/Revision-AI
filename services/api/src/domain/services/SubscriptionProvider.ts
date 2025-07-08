import { SubscriptionTier } from '../value-objects/subscriptionTier';
import { CustomerIdentifier } from '@entities/customer.entity';
import { CustomerDto } from '@modules/subscription/dto/customer.dto';
import { StripeSubscriptionProvider } from '../../infrastructure/stripe/StripeSubscriptionProvider';
import { SubscriptionInfo } from 'domain/value-objects/subscriptionPrice';
import { ReqUser } from '@common/types/request';
import { Invoice } from '@common/types/invoice';

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
  getProductsPrices(): Promise<SubscriptionInfo[] | Error>;
  getInvoices(customerId: string, user: ReqUser): Promise<Invoice[] | Error>;
}

export const SubscriptionPrvProvider = {
  provide: 'SubscriptionProvider',
  useClass: StripeSubscriptionProvider,
};
