import { CustomerIdentifier } from '@entities/customer.entity';

export class SubscriptionError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

export class CustomerNotFoundError extends SubscriptionError {
  constructor(customerIdentifier: CustomerIdentifier) {
    super(`Customer with ID ${customerIdentifier.customerId} not found.`);
    this.name = 'CustomerNotFoundError';
  }
}
