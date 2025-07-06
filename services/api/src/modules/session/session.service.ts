import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Session } from '@entities/session.entity';
import { CreateSessionDto } from '@modules/session/dto/create-session.dto';
import { SessionRepository } from '@repositories/session.repository';
import { UserRepository } from '@repositories/user.repository';
import { QuizRepository } from '@repositories/quiz.repository';
import { v4 as uuidv4 } from 'uuid';
import { EndSessionDto } from '@modules/session/dto/end-session.dto';
import { SessionAnswer } from '@entities/session.entity';
import { SessionStatus } from '@entities/session.entity';

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
      throw new NotFoundException(`Session with id ${id} not found`);
    }
    return session;
  }

  /**
   * Retrieves all sessions for a specific user.
   * @param userId - The ID of the user whose sessions are to be retrieved.
   * @returns An array of sessions associated with the user.
   */
  async findAllByUserId(userId: string): Promise<Session[]> {
    return this.sessionRepository.findAllByUserId(userId);
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
      throw new NotFoundException(`User with id ${createSessionDto.userId} not found`);
    }
    const quiz = await this.quizRepository.findById(createSessionDto.quizId);
    if (!quiz) {
      throw new NotFoundException(`Quiz with id ${createSessionDto.quizId} not found`);
    }
    const sessionData = {
      id: uuidv4(),
      quizId: quiz.id,
      userId: user.id,
      startedAt: new Date(),
      finishedAt: null,
      answers: [],
      score: 0,
      status: SessionStatus.ACTIVE,
    };
    return this.sessionRepository.create(sessionData);
  }

  /**
   * Starts a session by its ID.
   * @param id - The ID of the session to start.
   * @returns The started session.
   * @throws NotFoundException if the session does not exist.
   */
  async startSession(id: string): Promise<Session> {
    const session = await this.sessionRepository.startSession(id);
    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
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
  async endSession(id: string, endSessionDto: EndSessionDto): Promise<Session> {
    const { score, answers } = endSessionDto;
    const finishedAt = new Date();
    const formattedAnswers = (answers || []).map((a: any) => ({
      c: a.c ?? a.correct,
      a: a.a,
    }));
    const session = await this.sessionRepository.endSession(id, finishedAt, score, formattedAnswers);
    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }
    return session;
  }

  /**
   * Adds an answer to a session.
   * @param sessionId - The ID of the session to add the answer to.
   * @param answer - The answer to add.
   * @returns The updated session.
   * @throws NotFoundException if the session does not exist.
   */
  async addAnswer(sessionId: string, answer: any): Promise<Session> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with id ${sessionId} not found`);
    }
    const updatedAnswers: SessionAnswer[] = [
        ...session.answers,
        {
            c: answer.c ?? answer.correct,
            a: answer.a,
        },
        ];
    await this.sessionRepository.updateAnswers(sessionId, updatedAnswers);
    return await this.sessionRepository.findById(sessionId);
  }

  async pauseSession(id: string): Promise<Session> {
    const session = await this.sessionRepository.pauseSession(id);
    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }
    return session;
  }

  async resumeSession(id: string): Promise<Session> {
    const session = await this.sessionRepository.resumeSession(id);
    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }
    return session;
  }
}
