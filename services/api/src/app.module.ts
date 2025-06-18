import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { AuthGuard } from '@common/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@modules/auth/auth.module';
import { QuizModule } from '@modules/quiz/quiz.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://database:27017/api',
    ),
    UserModule,
    AuthModule,
    QuizModule,
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
