import { HandleParsedFileUseCaseFactory } from '../../../domain/usecases/QuizGenerationUseCase';
import { QuizRepository } from '@repositories/quiz.repository';
import { UserRepository } from '@repositories/user.repository';
import { QueueProvider } from '@services/QueueProvider';
import { QuizGenerationDTO } from '../../../types/QuizGenerationDTO';
import { INestApplication } from '@nestjs/common';
import { z } from 'zod';
import { createQueueConsumer } from '@infrastructure/queue/createQueueConsumer';
import { SubscriptionPolicyService } from '@domain/policies/SubscriptionPolicyService';

export function fileParsedQueueConsumer(app: INestApplication) {
  const quizRepository = app.get<QuizRepository>('QuizRepository');
  const jobRepository = app.get('QuizGenerationJobRepository');
  const cachedFileRepository = app.get('CachedFileParsedRepository');
  const quizQueueProvider = app.get<QueueProvider<QuizGenerationDTO>>(
    'QuizGenerationQueueProvider',
  );
  const subscriptionPolicyService = app.get<SubscriptionPolicyService>(
    'SubscriptionPolicyService',
  );
  const userRepository = app.get<UserRepository>('UserRepository');
  const handleParsedFileUseCase = HandleParsedFileUseCaseFactory(
    quizRepository,
    jobRepository,
    cachedFileRepository,
    quizQueueProvider,
    subscriptionPolicyService,
    userRepository,
  );

  const fileParsedEventSchema = z
    .object({
      checksum: z.string(),
      fileName: z.string(),
      objectKey: z.string(),
    })
    .catchall(z.any());

  /**
   * Handle event from the file parser
   */
  createQueueConsumer(
    'file-parsed',
    fileParsedEventSchema,
    // @ts-ignore
    handleParsedFileUseCase,
  ).then();
}
