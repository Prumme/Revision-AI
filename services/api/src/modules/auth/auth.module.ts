import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '@modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { CustomerRepositoryProvider } from '@repositories/customer.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@mongo/user/user.schema';
import { MailModule } from '@infrastructure/resend/mail.module';
import { AuthController } from './auth.controller';
import { CustomerRepositoryProvider } from '@repositories/customer.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@mongo/user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    UserModule,
    MailModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, CustomerRepositoryProvider],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
