import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { raw, json, urlencoded } from 'body-parser';
import { fileParsedQueueConsumer } from '@infrastructure/queue/consumers/fileParsedQueueConsumer';
import { quizGenerationQueueConsumer } from '@infrastructure/queue/consumers/quizGenerationQueueConsumer';

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

  fileParsedQueueConsumer(app);
  quizGenerationQueueConsumer(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
