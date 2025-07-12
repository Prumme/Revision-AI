import { MongoQuizRepository } from '@mongo/quiz/quiz.repository';
import { Quiz } from '../entities/quiz.entity';
import {  PaginatedResult, PaginationOptions } from './user.repository';


export interface QuizFilters {
  includeDeleted?: boolean;
  userId?: {
    id: string;
    exclude?: boolean; // If true, exclude quizzes created by this user
  };
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
  isPublic?: boolean | string;
  ready?: boolean;
}

export interface QuizRepository {
  findById(id: string): Promise<Quiz | null>;
  findAll(
    filters?: QuizFilters,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<Quiz>>;
  create(quiz: Omit<Quiz, 'id'>): Promise<Quiz>;
  update(id: string, quiz: Partial<Quiz>): Promise<Quiz>;
  delete(id: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
  countCreatedToday(userId: string): Promise<number>;
}

export const QuizRepositoryProvider = {
  provide: 'QuizRepository',
  useClass: MongoQuizRepository,
};
