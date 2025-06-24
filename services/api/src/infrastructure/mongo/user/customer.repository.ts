import { CustomerAndUser } from '@entities/customer.entity';
import { CustomerRepository } from '@repositories/customer.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '@mongo/user/user.schema';
import { Injectable } from '@nestjs/common';
import { SubscriptionTier } from '../../../domain/value-objects/subscriptionTier';
import { CustomerDto } from '@modules/subscription/dto/customer.dto';
import { User } from '@entities/user.entity';

@Injectable()
export class MongoCustomerRepository implements CustomerRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  putCustomer(
    userId: string,
    customer: CustomerDto & { customerId?: string },
  ): Promise<CustomerAndUser | null | Error> {
    return this.userModel.findOneAndUpdate(
      { _id: userId },
      {
        ...customer,
        updatedAt: new Date(),
      },
      { new: true, upsert: true },
    );
  }

  async findByUserId(userId: string): Promise<CustomerAndUser | User | null> {
    return this.userModel
      .findOne({ _id: userId })
      .exec()
      .then((document) => {
        if (!document) return null;
        if (!document.customerId) return document as User;
        return document.toObject() as CustomerAndUser;
      });
  }
  async findById(customerId: string): Promise<CustomerAndUser | null> {
    const document = await this.userModel.findOne({ customerId }).exec();
    if (!document && document.customerId) return null;
    return document.toObject() as CustomerAndUser;
  }
  async updateSubscriptionTier(
    customerId: string,
    subscriptionTier: SubscriptionTier,
  ): Promise<CustomerAndUser | null | Error> {
    try {
      const document = await this.userModel
        .findOneAndUpdate(
          { customerId },
          { subscriptionTier, updatedAt: new Date() },
          { new: true },
        )
        .exec();

      if (!document) return null;
      return document.toObject() as CustomerAndUser;
    } catch (error) {
      console.error('Error updating subscription tier:', error);
      return new Error('Failed to update subscription tier');
    }
  }
}
