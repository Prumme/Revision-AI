import { MinioModule } from '@modules/minio/minio.module';
import { UserModule } from '@modules/user/user.module';
import { QuizSchema } from '@mongo/quiz/quiz.schema';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizRepositoryProvider } from '@repositories/quiz.repository';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Quiz', schema: QuizSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => MinioModule),
  ],
  controllers: [QuizController],
  providers: [QuizService, QuizRepositoryProvider],
  exports: [QuizService],
})
export class QuizModule { }
