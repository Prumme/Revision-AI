import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthGuard } from '@common/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@modules/auth/auth.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { MinioModule } from './modules/minio/minio.module';
import { SubscriptionModule } from '@modules/subscription/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://database:27017/api',
    ),
    UserModule,
    AuthModule,
    QuizModule,
    SubscriptionModule,
    MinioModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
