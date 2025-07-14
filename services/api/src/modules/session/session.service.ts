import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as SessionEntity from '@entities/session.entity';
import { Session } from '@entities/session.entity';
import { CreateSessionDto } from '@modules/session/dto/create-session.dto';
import { SessionRepository } from '@repositories/session.repository';
import { PaginatedResult, UserRepository } from '@repositories/user.repository';
import { QuizRepository } from '@repositories/quiz.repository';
import { EndSessionDto } from '@modules/session/dto/end-session.dto';
import { SessionAnswer, SessionStatus } from '@entities/session.entity';
import { SessionAlreadyFinishedException } from './exceptions/session-already-finished.exception';
import { SessionNotFoundException } from './exceptions/session-not-found.exception';
import { SessionAccessDenied } from '@modules/session/exceptions/session-access-denied';

@Injectable()
export class SessionService {
  constructor(
    @Inject('SessionRepository')
    private readonly sessionRepository: SessionRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('QuizRepository')
    private readonly quizRepository: QuizRepository,
  ) {}

  /**
   * Retrieves a session by its ID.
   * @param id - The ID of the session to retrieve.
   * @returns The session with the specified ID.
   * @throws NotFoundException if the session does not exist.
   */
  async findById(id: string): Promise<Session> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new SessionNotFoundException();
    }
    return session;
  }

  /**
   * Retrieves all sessions for a specific user.
   * @param userId - The ID of the user whose sessions are to be retrieved.
   * @param options - Pagination and filtering options.
   * @returns An array of sessions associated with the user.
   */
  async findAllByUserId(
    userId: string,
    options: { scoreMin?: number; scoreMax?: number; status?: string } & {
      page: number;
      limit: number;
    },
  ): Promise<any> {
    return this.sessionRepository.findAllByUserId(userId, options);
  }

  /**
   * Retrieves all sessions for a specific quiz.
   * @param quizId - The ID of the quiz whose sessions are to be retrieved.
   * @param options - Pagination and filtering options.
   * @param excludeUserId - Optional user ID to exclude from the results.
   * @returns An array of sessions associated with the quiz.
   */
  async findAllByQuizId(
    quizId: string,
    options: { scoreMin?: number; scoreMax?: number; status?: string } & {
      page: number;
      limit: number;
    },
    excludeUserId?: string,
  ): Promise<PaginatedResult<Session>> {
    return this.sessionRepository.findAllByQuizId(
      quizId,
      options,
      excludeUserId,
    );
  }

  /**
   * Retrieves all sessions for a specific quiz and user.
   * @param quizId - The ID of the quiz.
   * @param userId - The ID of the user.
   * @param options
   * @returns An array of sessions associated with the quiz and user.
   */
  async findAllByQuizIdAndUserId(
    quizId: string,
    userId: string,
    options: { scoreMin?: number; scoreMax?: number; status?: string } & {
      page: number;
      limit: number;
    },
  ): Promise<any> {
    return this.sessionRepository.findAllByQuizIdAndUserId(
      quizId,
      userId,
      options,
    );
  }

  /**
   * Creates a new session.
   * @param createSessionDto - The DTO containing session details.
   * @returns The created session.
   * @throws NotFoundException if user or quiz not found.
   */
  async createSession(createSessionDto: CreateSessionDto): Promise<Session> {
    const user = await this.userRepository.findById(createSessionDto.userId);
    if (!user) {
      throw new NotFoundException(
        `User with id ${createSessionDto.userId} not found`,
      );
    }
    const quiz = await this.quizRepository.findById(createSessionDto.quizId);
    if (!quiz) {
      throw new NotFoundException(
        `Quiz with id ${createSessionDto.quizId} not found`,
      );
    }
    const session = SessionEntity.startSession(quiz.id, user.id);
    return this.sessionRepository.create(session);
  }

  /**
   * Starts a session by its ID.
   * @param id - The ID of the session to start.
   * @returns The started session.
   * @throws NotFoundException if the session does not exist.
   */
  async startSession(id: string): Promise<Session> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new SessionNotFoundException();
    }
    return session;
  }

  private async getSession(id: string, userId): Promise<Session> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new SessionNotFoundException();
    }
    if (session.userId !== userId) {
      throw new SessionAccessDenied();
    }
    if (session.status === SessionStatus.FINISHED) {
      throw new SessionAlreadyFinishedException();
    }
    return session;
  }

  /**
   * Ends a session by its ID.
   * @param id - The ID of the session to end.
   * @param endSessionDto
   * @returns The ended session.
   * @throws NotFoundException if the session does not exist.
   */
  async endSession(
    id: string,
    endSessionDto: EndSessionDto,
    userId: string,
  ): Promise<Session> {
    const session = await this.getSession(id, userId);

    const { score, answers } = endSessionDto;
    const formattedAnswers: SessionAnswer[] = (answers || []).map((a: any) => ({
      c: a.c ?? a.correct,
      a: a.a,
    }));

    let updatedSession = SessionEntity.endSession(session);
    updatedSession = SessionEntity.putScore(updatedSession, score);
    updatedSession = SessionEntity.putAnswers(updatedSession, formattedAnswers);

    const endedSession = await this.sessionRepository.patch(id, updatedSession);
    if (!endedSession) {
      throw new SessionNotFoundException();
    }
    return endedSession;
  }

  /**
   * Adds an answer to a session.
   * @param sessionId - The ID of the session to add the answer to.
   * @param answer - The answer to add.
   * @returns The updated session.
   * @throws NotFoundException if the session does not exist.
   */
  async addAnswer(
    sessionId: string,
    answer: any,
    userId: string,
  ): Promise<Session> {
    const session = await this.getSession(sessionId, userId);
    const answerParsed: SessionAnswer = {
      c: answer.c ?? answer.correct,
      a: answer.a,
    };

    let updatedSession = SessionEntity.addAnswer(session, answerParsed);
    updatedSession = await this.sessionRepository.patch(
      sessionId,
      updatedSession,
    );

    if (!updatedSession) {
      throw new SessionNotFoundException();
    }
    return updatedSession;
  }

  /**
   * Pauses a session by its ID.
   *
   * @param id
   * @return The paused session.
   */
  async pauseSession(id: string, userId: string): Promise<Session> {
    const session = await this.getSession(id, userId);
    const pausedSession = SessionEntity.pauseSession(session);
    return await this.sessionRepository.patch(id, pausedSession);
  }

  /**
   * Resumes a paused session by its ID.
   *
   * @param id
   * @return The resumed session.
   */
  async resumeSession(id: string, userId: string): Promise<Session> {
    const session = await this.getSession(id, userId);
    const resumedSession = SessionEntity.resumeSession(session);
    return await this.sessionRepository.patch(id, resumedSession);
  }
}
