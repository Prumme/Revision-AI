import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthGuard } from '@common/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@modules/auth/auth.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { MinioModule } from './modules/minio/minio.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300000,
      max: 100,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://database:27017/api',
    ),
    UserModule,
    AuthModule,
    QuizModule,
    MinioModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
