import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthGuard } from '@common/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@modules/auth/auth.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { CacheModule } from '@nestjs/cache-manager';

import { SubscriptionModule } from '@modules/subscription/subscription.module';
import { ReportModule } from '@modules/report/report.module';
import { SessionModule } from './modules/session/session.module';
import { KpiModule } from './modules/kpi/kpi.module';

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
    SubscriptionModule,
    ReportModule,
    SessionModule,
    KpiModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
