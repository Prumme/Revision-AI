import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { raw, json, urlencoded } from 'body-parser';
import { z } from 'zod';
import {
  HandleParsedFileUseCaseFactory,
  HandleQuizGenerationCompletedUseCaseFactory,
} from './domain/usecases/QuizGenerationUseCase';
import { QueueProvider } from '@services/QueueProvider';
import { QuizGenerationDTO } from './types/QuizGenerationDTO';
import { QuizRepository } from '@repositories/quiz.repository';
import { createQueueConsumer } from '@infrastructure/queue/createQueueConsumer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  app.use('/stripe/webhook', raw({ type: 'application/json' }));
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Revision-AI')
    .setDescription("Documentation de l'API Revision-AI")
    .setVersion('1.0')
    .addTag('Utilisateurs')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const quizRepository = app.get<QuizRepository>('QuizRepository');
  const jobRepository = app.get('QuizGenerationJobRepository');
  const cachedFileRepository = app.get('CachedFileParsedRepository');
  const quizQueueProvider = app.get<QueueProvider<QuizGenerationDTO>>(
    'QuizGenerationQueueProvider',
  );
  const handleParsedFileUseCase = HandleParsedFileUseCaseFactory(
    quizRepository,
    jobRepository,
    cachedFileRepository,
    quizQueueProvider,
  );
  const handleQuizCompletedUseCase =
    HandleQuizGenerationCompletedUseCaseFactory(quizRepository, jobRepository);

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
  await createQueueConsumer(
    'file-parsed',
    fileParsedEventSchema,
    // @ts-ignore
    handleParsedFileUseCase,
  );

  /**
   * Handle message from the quiz generator
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

  await createQueueConsumer(
    'quiz-generated',
    quizGeneratedEventSchema,
    // @ts-ignore
    handleQuizCompletedUseCase,
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
