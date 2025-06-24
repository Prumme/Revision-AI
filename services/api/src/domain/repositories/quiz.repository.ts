import { MongoQuizRepository } from '@mongo/quiz/quiz.repository';
import { Quiz } from '../entities/quiz.entity';
import { PaginatedResult, PaginationOptions } from './user.repository';

export interface QuizFilters {
  includeDeleted?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QuizRepository {
  findById(id: string): Promise<Quiz | null>;
  findAll(
    filters?: QuizFilters,
    pagination?: PaginationOptions,
  ): Promise<Quiz[]>;
  create(quiz: Omit<Quiz, 'id'>): Promise<Quiz>;
  update(id: string, quiz: Partial<Quiz>): Promise<Quiz>;
  delete(id: string): Promise<boolean>;
}

export const QuizRepositoryProvider = {
  provide: 'QuizRepository',
  useClass: MongoQuizRepository,
};
