import { Injectable } from '@nestjs/common';
import {
  PaginatedResult,
  SessionOptions,
  SessionRepository,
} from '@repositories/session.repository';
import { InjectModel } from '@nestjs/mongoose';
import { SessionDocument } from './session.schema';
import { Model } from 'mongoose';
import {
  Session,
  SessionAnswer,
  SessionStatus,
} from '@entities/session.entity';

@Injectable()
export class MongoSessionRepository implements SessionRepository {
  constructor(
    @InjectModel('Session')
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  /**
   * Finds a session by its ID.
   * @param id - The ID of the session to find.
   * @returns The session if found, otherwise null.
   */
  async findById(id: string): Promise<Session | null> {
    const document = await this.sessionModel.findById(id).exec();
    if (!document) return null;
    return this.documentToSession(document);
  }

  /**
   * Constructs the query and handles pagination.
   * @param queryCriteria - The base query object.
   * @param options - Pagination and filtering options.
   * @returns A paginated result of sessions.
   */
  private async findAndPaginateSessions(
    queryCriteria: any,
    options: SessionOptions,
  ): Promise<PaginatedResult<Session>> {
    const query = { ...queryCriteria };

    if (options.status && options.status !== 'all') {
      query.status = options.status;
    }

    if (
      typeof options.scoreMin === 'number' ||
      typeof options.scoreMax === 'number'
    ) {
      query.score = {};
      if (typeof options.scoreMin === 'number') {
        query.score.$gte = options.scoreMin;
      }
      if (typeof options.scoreMax === 'number') {
        query.score.$lte = options.scoreMax;
      }
    }

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [total, documents] = await Promise.all([
      this.sessionModel.countDocuments(query),
      this.sessionModel.find(query).skip(skip).limit(limit).exec(),
    ]);

    return {
      data: documents.map(this.documentToSession),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Finds all sessions for a specific user.
   * @param userId - The ID of the user.
   * @param options - Pagination and filtering options.
   * @returns A paginated result of sessions.
   */
  async findAllByUserId(
    userId: string,
    options: SessionOptions,
  ): Promise<PaginatedResult<Session>> {
    return this.findAndPaginateSessions({ userId }, options);
  }

  /**
   * Finds all sessions for a specific quiz.
   * @param quizId - The ID of the quiz whose sessions are to be retrieved.
   * @param options - Pagination and filtering options.
   * @param excludeUserId - Optional user ID to exclude.
   * @returns A paginated result of sessions.
   */
  async findAllByQuizId(
    quizId: string,
    options: SessionOptions,
    excludeUserId?: string,
  ): Promise<PaginatedResult<Session>> {
    const queryCriteria: any = { quizId };
    if (excludeUserId) {
      queryCriteria.userId = { $ne: excludeUserId };
    }
    return this.findAndPaginateSessions(queryCriteria, options);
  }

  /**
   * Finds all sessions for a specific quiz and user.
   * @param quizId - The ID of the quiz.
   * @param userId - The ID of the user.
   * @param options - Pagination and filtering options.
   * @returns A paginated result of sessions.
   */
  async findAllByQuizIdAndUserId(
    quizId: string,
    userId: string,
    options: SessionOptions,
  ): Promise<PaginatedResult<Session>> {
    if (!quizId || !userId || userId === 'undefined') {
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 1 };
    }
    return this.findAndPaginateSessions({ quizId, userId }, options);
  }

  /**
   * Creates a new session.
   * @param session - The session data to create.
   * @returns The created session.
   */
  async create(session: Omit<Session, 'id'>): Promise<Session> {
    const document = await this.sessionModel.create(session);
    return this.documentToSession(document);
  }

  /**
   * Starts a session by its ID.
   * @param id - The ID of the session to start.
   * @returns The started session, or null if not found.
   */
  async startSession(id: string): Promise<Session | null> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  async patch(id: string, update: Partial<Session>): Promise<Session | null> {
    const session = await this.sessionModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  /**
   * Ends a session by updating its finishedAt time, score, and answers.
   * @param id - The ID of the session to end.
   * @param finishedAt - The time when the session was finished.
   * @param score - The final score of the session.
   * @param answers - The answers provided during the session.
   * @returns The updated session, or null if not found.
   */
  async endSession(
    id: string,
    finishedAt: Date,
    score: number,
    answers: SessionAnswer[],
  ): Promise<Session | null> {
    const existing = await this.sessionModel.findById(id).exec();
    if (!existing) return null;
    const startedAt = existing.startedAt;
    const duration =
      startedAt && finishedAt
        ? Math.round((+finishedAt - +startedAt) / 1000)
        : undefined;
    const session = await this.sessionModel
      .findByIdAndUpdate(
        id,
        { finishedAt, score, answers, duration },
        { new: true },
      )
      .exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  /**
   * Updates the answers of a session.
   * @param sessionId - The ID of the session to update.
   * @param answers - The new answers to set for the session.
   * @returns The updated session, or null if not found.
   */
  async updateAnswers(
    sessionId: string,
    answers: SessionAnswer[],
  ): Promise<Session | null> {
    const session = await this.sessionModel
      .findByIdAndUpdate(sessionId, { answers }, { new: true })
      .exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  /**
   * Pauses a session by updating its status to 'paused'.
   * @param id - The ID of the session to pause.
   * @returns The updated session, or null if not found.
   */
  async pauseSession(id: string): Promise<Session | null> {
    const session = await this.sessionModel
      .findByIdAndUpdate(id, { status: 'paused' }, { new: true })
      .exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  /**
   * Resumes a paused session by updating its status to 'active'.
   *
   * @param id - The ID of the session to resume.
   * @return The updated session, or null if not found.
   */
  async resumeSession(id: string): Promise<Session | null> {
    const session = await this.sessionModel
      .findByIdAndUpdate(id, { status: 'active' }, { new: true })
      .exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  /**
   * Updates the status of a session.
   *
   * @param id - The ID of the session to update.
   * @param status - The new status to set for the session.
   * @return The updated session, or null if not found.
   */
  async updateStatus(id: string, status: string): Promise<Session | null> {
    const session = await this.sessionModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  /**
   * Converts a Mongoose document to a Session entity.
   *
   * @param document - The Mongoose document to convert.
   * @return The converted Session entity.
   */
  private documentToSession(document: SessionDocument): Session {
    return {
      id: document._id.toString(),
      quizId: document.quizId.toString(),
      userId: document.userId.toString(),
      score: document.score,
      duration: document.duration,
      startedAt: document.startedAt,
      finishedAt: document.finishedAt,
      answers: (document.answers || []).map((a: any) => ({
        c: a.c ?? a.correct,
        a: a.a,
      })),
      status: document.status as SessionStatus,
    };
  }
}
