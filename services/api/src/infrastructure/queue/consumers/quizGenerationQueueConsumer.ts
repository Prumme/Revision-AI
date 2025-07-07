import { INestApplication } from '@nestjs/common';
import { createQueueConsumer } from '@infrastructure/queue/createQueueConsumer';
import { HandleQuizGenerationCompletedUseCaseFactory } from '../../../domain/usecases/QuizGenerationUseCase';
import { QuizRepository } from '@repositories/quiz.repository';
import { z } from 'zod';

export function quizGenerationQueueConsumer(app: INestApplication) {
  const quizRepository = app.get<QuizRepository>('QuizRepository');
  const jobRepository = app.get('QuizGenerationJobRepository');

  const handleQuizCompletedUseCase =
    HandleQuizGenerationCompletedUseCaseFactory(quizRepository, jobRepository);
  /**
   * Handle a message from the quiz generator
   */
  const quizGeneratedEventSchema = z.object({
    identifier: z.string().optional(),
    success: z.boolean(),
    error: z.string().optional(),
    questions: z
      .array(
        z.object({
          q: z.string(),
          answers: z.array(
            z.object({
              a: z.string(),
              c: z.boolean().optional(),
              _id: z.string().optional(),
            }),
          ),
        }),
      )
      .optional(),
    t: z.string().optional(),
  });

  createQueueConsumer(
    'quiz-generated',
    quizGeneratedEventSchema,
    // @ts-ignore
    handleQuizCompletedUseCase,
  ).then();
}
