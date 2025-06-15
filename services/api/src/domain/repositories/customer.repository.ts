import { CustomerAndUser } from '@entities/customer.entity';
import { SubscriptionTier } from '../value-objects/subscriptionTier';
import { CustomerDto } from '@modules/subscription/dto/customer.dto';
import { MongoCustomerRepository } from '@mongo/user/customer.repository';
import { User } from '@entities/user.entity';

export interface CustomerRepository {
  findByUserId(userId: string): Promise<CustomerAndUser | User | null>;
  findById(customerId: string): Promise<CustomerAndUser | null>;
  updateSubscriptionTier(
    customerId: string,
    subscriptionTier: SubscriptionTier,
  ): Promise<CustomerAndUser | null | Error>;

  putCustomer(
    userId: string,
    customer: CustomerDto & { customerId?: string },
  ): Promise<CustomerAndUser | null | Error>;
}

export const CustomerRepositoryProvider = {
  provide: 'CustomerRepository',
  useClass: MongoCustomerRepository,
};
