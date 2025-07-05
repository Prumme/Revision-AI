import { Session } from '../entities/session.entity';
import { MongoSessionRepository } from '@mongo/session/session.repository';

export interface SessionRepository {
  findById(id: string): Promise<Session | null>;
  findAllByUserId(userId: string): Promise<Session[]>;
  create(user: Omit<Session, 'id'>): Promise<Session>;
  startSession(id: string): Promise<Session | null>;
  endSession(id: string): Promise<Session | null>;
  updateAnswers(sessionId: string, answers: any[]): Promise<Session | null>;
}

export const SessionRepositoryProvider = {
  provide: 'SessionRepository',
  useClass: MongoSessionRepository,
};