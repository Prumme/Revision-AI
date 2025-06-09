import { MongoQuizRepository } from '@mongo/quiz/quiz.repository';
import { Quiz } from '../entities/quiz.entity';
import { CreateQuizDto } from '@modules/quiz/dto/create-quiz.dto';

export interface QuizRepository {
  findById(id: string): Promise<Quiz | null>;
  findAll(): Promise<Quiz[]>;
  create(quiz: CreateQuizDto): Promise<Quiz>;
  update(id: string, quiz: Partial<Quiz>): Promise<Quiz>;
  delete(id: string): Promise<boolean>;
}

export const QuizRepositoryProvider = {
  provide: 'QuizRepository',
  useClass: MongoQuizRepository,
};
