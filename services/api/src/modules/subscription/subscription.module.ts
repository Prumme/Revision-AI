import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { StripeController } from '@modules/subscription/stripe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionPrvProvider } from '@services/SubscriptionProvider';
import { CustomerRepositoryProvider } from '@repositories/customer.repository';
import { UserSchema } from '@mongo/user/user.schema';
import { AuthModule } from '@modules/auth/auth.module';
import { MailModule } from '@infrastructure/resend/mail.module';
import { MailerServiceProvider } from '@services/MailerService';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    AuthModule,
    MailModule,
  ],
  controllers: [SubscriptionController, StripeController],
  providers: [
    SubscriptionPrvProvider,
    CustomerRepositoryProvider,
    MailerServiceProvider,
  ],
})
export class SubscriptionModule {}
