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

export interface SessionOptions extends PaginationOptions {
  page: number;
  limit: number;
  scoreMin?: number;
  scoreMax?: number;
  status?: string;
}

export interface SessionRepository {
  findById(id: string): Promise<Session | null>;

  findAllByUserId(
    userId: string,
    options: SessionOptions,
  ): Promise<PaginatedResult<Session>>;

  findAllByQuizId(
    quizId: string,
    options: SessionOptions,
    excludeUserId?: string,
  ): Promise<PaginatedResult<Session>>;

  create(user: Omit<Session, 'id'>): Promise<Session>;

  patch(id: string, update: Partial<Session>): Promise<Session | null>;

  findAllByQuizIdAndUserId(
    quizId: string,
    userId: string,
    options: SessionOptions,
  ): Promise<PaginatedResult<Session>>;
}

export const SessionRepositoryProvider = {
  provide: 'SessionRepository',
  useClass: MongoSessionRepository,
};
