import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from '@mongo/session/session.schema';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { SessionRepositoryProvider } from '@repositories/session.repository';
import { UserModule } from '@modules/user/user.module';
import { QuizModule } from '@modules/quiz/quiz.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => QuizModule),
  ],
  controllers: [SessionController],
  providers: [SessionService, SessionRepositoryProvider],
})
export class SessionModule {}
