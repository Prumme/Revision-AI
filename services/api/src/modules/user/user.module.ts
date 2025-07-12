import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from '@mongo/user/user.schema';
import { UserRepositoryProvider } from '@repositories/user.repository';
import { MinioModule } from '@modules/minio/minio.module';
import { MailModule } from '@infrastructure/resend/mail.module';
import { CustomerRepositoryProvider } from '@repositories/customer.repository';
import { MongoCustomerRepository } from '@mongo/user/customer.repository';
import { MailerServiceProvider } from '@services/MailerService';
import { QuizRepositoryProvider } from '@repositories/quiz.repository';
import { QuizSchema } from '@mongo/quiz/quiz.schema';
import { QuizService } from '@modules/quiz/quiz.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Quiz', schema: QuizSchema },
    ]),
    MinioModule,
    MailModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    QuizService,
    UserRepositoryProvider,
    CustomerRepositoryProvider,
    MongoCustomerRepository,
    MailerServiceProvider,
    QuizRepositoryProvider,
  ],
  exports: [UserService, UserRepositoryProvider],
})
export class UserModule {}
