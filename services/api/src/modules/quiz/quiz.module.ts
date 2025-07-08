import { MinioModule } from '@modules/minio/minio.module';
import { UserModule } from '@modules/user/user.module';
import { QuizSchema } from '@mongo/quiz/quiz.schema';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizRepositoryProvider } from '@repositories/quiz.repository';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import {UserRepositoryProvider} from "@repositories/user.repository";
import {UserSchema} from "@mongo/user/user.schema";
import { CachedFileParsedSchema } from '@mongo/quiz/cached-file-parsed.schema';
import { QuizGenerationJobSchema } from '@mongo/quiz/quiz-generation-job.schema';
import { CachedFileParsedRepositoryProvider } from '@repositories/cached-file-parsed.repository';
import { QuizGenerationJobRepositoryProvider } from '@repositories/quiz-generation-job.repository';
import { QuizGenerationDTO } from 'types/QuizGenerationDTO';
import { FileToParseDTO } from 'types/FileToParseDTO';
import { RabbitMQProvider } from '@infrastructure/queue/RabbitMQProvider';
import { QuizQuotaService } from './quiz-quota.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema },{ name: 'Quiz', schema: QuizSchema }]),
      MongooseModule.forFeature([
      { name: 'CacheFileParsed', schema: CachedFileParsedSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'QuizGenerationJob', schema: QuizGenerationJobSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => MinioModule),
  ],
  controllers: [QuizController],
  providers: [
      UserRepositoryProvider,
    QuizService,
    QuizRepositoryProvider,
    CachedFileParsedRepositoryProvider,
    QuizGenerationJobRepositoryProvider,
    QuizQuotaService,
    {
      provide: 'QuizGenerationQueueProvider',
      useFactory: () => {
        return new RabbitMQProvider<QuizGenerationDTO>('generate-quiz');
      },
    },
    {
      provide: 'FileUploadedQueueProvider',
      useFactory: () => {
        return new RabbitMQProvider<FileToParseDTO>('file-uploaded');
      },
    },
  ],
  exports: [
    QuizService,
    QuizRepositoryProvider,
    CachedFileParsedRepositoryProvider,
    QuizGenerationJobRepositoryProvider,
    'QuizGenerationQueueProvider',
    'FileUploadedQueueProvider',
  ],
})
export class QuizModule {}
