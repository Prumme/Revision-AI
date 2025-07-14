import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { raw, json, urlencoded } from 'body-parser';
import { fileParsedQueueConsumer } from '@infrastructure/queue/consumers/fileParsedQueueConsumer';
import { quizGenerationQueueConsumer } from '@infrastructure/queue/consumers/quizGenerationQueueConsumer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/stripe/webhook', raw({ type: 'application/json' }));

  app.use((req, res, next) => {
    if (req.path === '/stripe/webhook') return next();
    json({ limit: '10mb' })(req, res, () => {
      urlencoded({ limit: '10mb', extended: true })(req, res, next);
    });
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
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

  fileParsedQueueConsumer(app);
  quizGenerationQueueConsumer(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
