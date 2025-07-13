import { Session, SessionAnswer } from '../entities/session.entity';
import { MongoSessionRepository } from '@mongo/session/session.repository';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SessionRepository {
  findById(id: string): Promise<Session | null>;

  findAllByUserId(
    userId: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Session>>;

  findAllByQuizId(quizId: string, excludeUserId?: string): Promise<Session[]>;

  create(user: Omit<Session, 'id'>): Promise<Session>;

  patch(id: string, update: Partial<Session>): Promise<Session | null>;

  findAllByQuizIdAndUserId(
    quizId: string,
    userId: string,
  ): Promise<PaginatedResult<Session>>;
}

export const SessionRepositoryProvider = {
  provide: 'SessionRepository',
  useClass: MongoSessionRepository,
};
