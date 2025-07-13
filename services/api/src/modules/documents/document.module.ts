import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentRepositoryProvider } from '@repositories/document.repository';
import { QuizSchema } from '@mongo/quiz/quiz.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Quiz', schema: QuizSchema }])],
  controllers: [DocumentController],
  providers: [DocumentRepositoryProvider, DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
