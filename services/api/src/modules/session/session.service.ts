import {Injectable, Inject, ForbiddenException, NotFoundException} from '@nestjs/common';
import {Session} from '@entities/session.entity';
import {CreateSessionDto} from '@modules/session/dto/create-session.dto';
import {SessionRepository} from '@repositories/session.repository';
import {UserRepository} from '@repositories/user.repository';
import {QuizRepository} from '@repositories/quiz.repository';
import {v4 as uuidv4} from 'uuid';
import {EndSessionDto} from '@modules/session/dto/end-session.dto';
import {SessionAnswer, SessionStatus} from '@entities/session.entity';
import { SessionAlreadyFinishedException } from './exceptions/session-already-finished.exception';
import { SessionNotFoundException } from './exceptions/session-not-found.exception';

@Injectable()
export class SessionService {
    constructor(
        @Inject('SessionRepository')
        private readonly sessionRepository: SessionRepository,
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('QuizRepository')
        private readonly quizRepository: QuizRepository,
    ) {
    }

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
     * @param filters
     * @param pagination
     * @returns An array of sessions associated with the user.
     */
    async findAllByUserId(
        userId: string,
        filters: { scoreMin?: number; scoreMax?: number; status?: string },
        pagination: { page: number; limit: number }
    ): Promise<any> {
        return this.sessionRepository.findAllByUserId(userId, { ...pagination, ...filters });
    }

    /**
     * Retrieves all sessions for a specific quiz.
     * @param quizId - The ID of the quiz whose sessions are to be retrieved.
     * @returns An array of sessions associated with the quiz.
     */
    async findAllByQuizId(quizId: string, excludeUserId?: string): Promise<Session[]> {
        return this.sessionRepository.findAllByQuizId(quizId, excludeUserId);
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
            throw new SessionNotFoundException();
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
    async endSession(id: string, endSessionDto: EndSessionDto, userId: string): Promise<Session> {
        const {score, answers} = endSessionDto;
        const finishedAt = new Date();
        const formattedAnswers = (answers || []).map((a: any) => ({
            c: a.c ?? a.correct,
            a: a.a,
        }));
        const session = await this.sessionRepository.findById(id);
        if (!session) {
            throw new SessionNotFoundException();
        }
        if (session.userId !== userId) {
            throw new ForbiddenException('Vous ne pouvez pas modifier cette session');
        }
        await this.sessionRepository.updateStatus(id, SessionStatus.FINISHED);
        const endedSession = await this.sessionRepository.endSession(id, finishedAt, score, formattedAnswers);
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
    async addAnswer(sessionId: string, answer: any, userId: string): Promise<Session> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new SessionNotFoundException();
        }
        if (session.userId !== userId) {
            throw new ForbiddenException('Vous ne pouvez pas modifier cette session');
        }
        if (session.status === SessionStatus.FINISHED) {
            throw new SessionAlreadyFinishedException();
        }
        const updatedAnswers: SessionAnswer[] = [
            ...session.answers,
            {
                c: answer.c ?? answer.correct,
                a: answer.a,
            },
        ];
        await this.sessionRepository.updateAnswers(sessionId, updatedAnswers);
        const updatedSession = await this.sessionRepository.findById(sessionId);
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
        const session = await this.sessionRepository.findById(id);
        if (!session) {
            throw new SessionNotFoundException();
        }
        if (session.userId !== userId) {
            throw new ForbiddenException('Vous ne pouvez pas modifier cette session');
        }
        if (session.status === SessionStatus.FINISHED) {
            throw new SessionAlreadyFinishedException();
        }
        const pausedSession = await this.sessionRepository.pauseSession(id);
        pausedSession.status = SessionStatus.PAUSED;
        await this.sessionRepository.updateStatus(id, SessionStatus.PAUSED);
        return pausedSession;
    }

    /**
     * Resumes a paused session by its ID.
     *
     * @param id
     * @return The resumed session.
     */
    async resumeSession(id: string, userId: string): Promise<Session> {
        const session = await this.sessionRepository.findById(id);
        if (!session) {
            throw new SessionNotFoundException();
        }
        if (session.userId !== userId) {
            throw new ForbiddenException('Vous ne pouvez pas modifier cette session');
        }
        if (session.status === SessionStatus.FINISHED) {
            throw new SessionAlreadyFinishedException();
        }
        const resumedSession = await this.sessionRepository.resumeSession(id);
        resumedSession.status = SessionStatus.ACTIVE;
        await this.sessionRepository.updateStatus(id, SessionStatus.ACTIVE);
        return resumedSession;
    }
}
