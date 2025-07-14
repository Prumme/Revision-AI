import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from '@mongo/user/user.schema';
import { UserRepositoryProvider } from '@repositories/user.repository';
import { MinioModule } from '@modules/minio/minio.module';
import { MailModule } from '@infrastructure/resend/mail.module';
import { CustomerRepositoryProvider } from '@repositories/customer.repository';
import { MongoCustomerRepository } from '@mongo/user/customer.repository';
import { QuizModule } from '@modules/quiz/quiz.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MinioModule,
    MailModule,
    forwardRef(() => QuizModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepositoryProvider,
    CustomerRepositoryProvider,
    MongoCustomerRepository,
  ],
  exports: [UserService, UserRepositoryProvider],
})
export class UserModule {}
