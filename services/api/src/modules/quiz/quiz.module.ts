import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizRepositoryProvider } from '@repositories/quiz.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizSchema } from '@mongo/quiz/quiz.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Quiz', schema: QuizSchema }])],
  controllers: [QuizController],
  providers: [QuizService, QuizRepositoryProvider],
  exports: [QuizService],
})
export class QuizModule {}
