import { UseCase, UseCaseFactory } from './IUseCase';
import { SubscriptionTier } from '../value-objects/subscriptionTier';
import { CustomerRepository } from '@repositories/customer.repository';
import { SubscriptionProvider } from '@services/SubscriptionProvider';
import { SubscriptionError } from '../errors/SubscriptionError';
import { CustomerDto } from '@modules/subscription/dto/customer.dto';
import { CustomerAndUser } from '@entities/customer.entity';
import { MailService } from '@infrastructure/resend/mail.service';

/**
 * UseCase to create a customer in the subscription service.
 * Create the customer on the external service
 */
export type UpsertCustomerUseCase = UseCase<
  CustomerDto & { userId: string },
  Promise<CustomerAndUser | Error>
>;
export const UpsertCustomerUseCaseFactory: UseCaseFactory<
  UpsertCustomerUseCase,
  [SubscriptionProvider, CustomerRepository]
> = (subscriptionProvider, customerRepository) => {
  return async (customerPayload) => {
    const customerAndUser = await customerRepository.findByUserId(
      customerPayload.userId,
    ); // its return a user if the customer profile is not completed

    if (!customerAndUser)
      return new Error(
        'Cannot find the user need to be attached to a customer',
      );

    const response = await subscriptionProvider.upsertCustomer({
      ...customerPayload,
      email: customerAndUser.email,
      customerId: customerAndUser?.customerId || undefined, // Use existing customerId if available
    });
    if (!response || response instanceof Error) {
      console.error('Error creating customer:', response);
      return new Error('Cannot create customer');
    }

    const result = await customerRepository.putCustomer(
      customerPayload.userId,
      {
        ...customerPayload,
        customerId: response.customerId, // Assuming the response contains the customer ID
      },
    );

    if (!result || result instanceof Error) {
      console.error('Error saving customer in database:', result);
      return new Error('Cannot save customer in database');
    }
    return result;
  };
};

/**
 * UseCase to create a subscription for a customer.
 * Use the `SubscriptionServiceAdapter` to interact with the subscription service
 * Create the subscription on the external service
 */
export type SubscribeUseCase = UseCase<
  {
    customerId: string;
    paymentMethodId?: string;
    tier: SubscriptionTier;
  },
  Promise<true | Error>
>;
export const SubscribeUseCaseFactory: UseCaseFactory<
  SubscribeUseCase,
  [SubscriptionProvider]
> = (subscriptionProvider) => {
  return async ({ customerId, tier, paymentMethodId }) => {
    const response = await subscriptionProvider.subscribe(
      { customerId },
      tier,
      paymentMethodId,
    );
    if (!response) {
      if (response instanceof SubscriptionError) return response;
      return new Error('Cannot subscribe');
    }
    return true;
  };
};

/**
 * UseCase to create a subscription for a customer.
 * Use the `SubscriptionServiceAdapter` to interact with the subscription service
 * Create the subscription on the external service
 */
export type UnsubscribeUseCase = UseCase<
  {
    customerId: string;
  },
  Promise<true | Error>
>;
export const UnsubscribeUseCaseFactory: UseCaseFactory<
  UnsubscribeUseCase,
  [SubscriptionProvider]
> = (subscriptionProvider) => {
  return async ({ customerId }) => {
    const response = await subscriptionProvider.unsubscribe({
      customerId,
    });
    if (!response) {
      return new Error('Cannot unsubscribe');
    }
    return true;
  };
};

/**
 * UseCase to handle activation of a subscription for a customer.
 * Trigger by a event from the subscription service (payment success, etc.)
 * its call every time the subscription is activated / paid (e.g. monthly)
 */
export type ActiveSubscriptionUseCase = UseCase<
  {
    customerId: string;
    tier: SubscriptionTier;
  },
  Promise<true | Error>
>;
export const ActiveSubscriptionUseCaseFactory: UseCaseFactory<
  ActiveSubscriptionUseCase,
  [MailService, CustomerRepository]
> = (_mailService, _customerRepository) => {
  return async ({ customerId, tier }) => {
    if (tier === SubscriptionTier.FREE)
      throw new Error('Free tier cannot be activated');

    const existingCustomer = await _customerRepository.findById(customerId);
    if (!existingCustomer) {
      console.error('Customer not found:', customerId);
      return new Error('Customer not found');
    }

    // the tier is already active (case of a monthly payment)
    if (existingCustomer.subscriptionTier === tier) {
      return true;
    }

    const response = await _customerRepository.updateSubscriptionTier(
      customerId,
      tier,
    );

    if (!response || response instanceof Error) {
      console.error('Error updating subscription tier:', response);
      return new Error('Cannot update subscription tier');
    }

    const sent = await _mailService.sendSubscriptionActivationEmail(
      response.email,
      {
        username: response.username,
        articleName: 'Abonnement ' + tier,
      },
    );
    if (sent instanceof Error) return sent;

    return true;
  };
};

/**
 * UseCase to handle the disactivation of a subscription for a customer.
 * Trigger by a event from the subscription service (payment failure, subscription cancelled, etc.)
 * its call every time the subscription is disactivated / not paid (e.g. monthly)
 */
export type InactiveSubscriptionUseCase = UseCase<
  {
    customerId: string;
  },
  Promise<true | Error>
>;
export const InactiveSubscriptionUseCaseFactory: UseCaseFactory<
  InactiveSubscriptionUseCase,
  [MailService, CustomerRepository]
> = (_mailService, _customerRepository) => {
  return async ({ customerId }) => {
    // 1. update the user subscription status in the database
    const existingCustomer = await _customerRepository.findById(customerId);
    if (!existingCustomer) {
      console.error('Customer not found:', customerId);
      return new Error('Customer not found');
    }

    if (existingCustomer.subscriptionTier === SubscriptionTier.FREE) {
      return true;
    }

    const response = await _customerRepository.updateSubscriptionTier(
      customerId,
      SubscriptionTier.FREE,
    );

    if (!response || response instanceof Error) {
      console.error('Error updating subscription tier:', response);
      return new Error('Cannot update subscription tier');
    }

    const sent = await _mailService.sendSubscriptionDeactivationEmail(
      response.email,
      {
        username: response.username,
      },
    );

    if (sent instanceof Error) return sent;

    return true;
  };
};
