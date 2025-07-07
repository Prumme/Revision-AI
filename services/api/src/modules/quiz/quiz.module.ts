import { MinioModule } from '@modules/minio/minio.module';
import { UserModule } from '@modules/user/user.module';
import { QuizSchema } from '@mongo/quiz/quiz.schema';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizRepositoryProvider } from '@repositories/quiz.repository';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QueueProvider } from "@infrastructure/queue/queueProvider";
import {UserRepositoryProvider} from "@repositories/user.repository";
import {UserSchema} from "@mongo/user/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema },{ name: 'Quiz', schema: QuizSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => MinioModule),
  ],
  controllers: [QuizController],
  providers: [
      UserRepositoryProvider,
    QuizService,
    QuizRepositoryProvider,
    {
      provide: 'QueueProvider',
      useValue: QueueProvider,
    },
  ],
  exports: [
    QuizService,
    QuizRepositoryProvider,
    {
      provide: 'QueueProvider',
      useValue: QueueProvider,
    },
  ],
})
export class QuizModule {}

