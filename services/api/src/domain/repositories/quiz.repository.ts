import { MongoQuizRepository } from '@mongo/quiz/quiz.repository';
import { Quiz } from '../entities/quiz.entity';
import { PaginationOptions } from './user.repository';

export interface QuizFilters {
  includeDeleted?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
  isPublic?: boolean | string;
}

export interface QuizRepository {
  findById(id: string): Promise<Quiz | null>;
  findAll(
    filters?: QuizFilters,
    pagination?: PaginationOptions,
  ): Promise<Quiz[]>;
  findAllByUserId(userId: string, filters?: QuizFilters): Promise<Quiz[]>;
  create(quiz: Omit<Quiz, 'id'>): Promise<Quiz>;
  update(id: string, quiz: Partial<Quiz>): Promise<Quiz>;
  delete(id: string): Promise<boolean>;

  // Quotas
  countByUserId(userId: string): Promise<number>;
  countByUserIdAndDateRange(userId: string, from: Date, to: Date): Promise<number>;
}

export const QuizRepositoryProvider = {
  provide: 'QuizRepository',
  useClass: MongoQuizRepository,
};
