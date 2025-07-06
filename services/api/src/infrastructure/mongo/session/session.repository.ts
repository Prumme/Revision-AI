import {Injectable} from "@nestjs/common";
import {SessionRepository} from "@repositories/session.repository";
import {InjectModel} from "@nestjs/mongoose";
import {SessionDocument} from "./session.schema";
import {Model} from 'mongoose';
import {Session, SessionAnswer, SessionStatus} from "@entities/session.entity";
import {SessionFiltersDto} from "@modules/session/dto/filter-session.dto";

@Injectable()
export class MongoSessionRepository implements SessionRepository {
    constructor(
        @InjectModel('Session')
        private readonly sessionModel: Model<SessionDocument>,
    ) {
    }

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
     * Finds all sessions for a specific user, optionally filtered by status and score range.
     * @param userId - The ID of the user whose sessions are to be retrieved.
     * @param filters - Optional filters for status and score range.
     * @returns An array of sessions associated with the user.
     */
    async findAllByUserId(userId: string, filters?: SessionFiltersDto): Promise<Session[]> {
        const query: any = {userId};
        if (filters) {
            if (filters.status) query.status = filters.status;
            if (typeof filters.scoreMin === 'number') query.score = {...query.score, $gte: filters.scoreMin};
            if (typeof filters.scoreMax === 'number') query.score = {...query.score, $lte: filters.scoreMax};
        }
        const documents = await this.sessionModel.find(query).exec();
        return documents.map(this.documentToSession);
    }

    /**
     * Finds all sessions for a specific quiz.
     * @param quizId - The ID of the quiz whose sessions are to be retrieved.
     * @param excludeUserId
     * @returns An array of sessions associated with the quiz.
     */
    async findAllByQuizId(quizId: string, excludeUserId?: string): Promise<Session[]> {
        const query: any = { quizId };
        if (excludeUserId) {
            query.userId = { $ne: excludeUserId };
        }
        const documents = await this.sessionModel.find(query).exec();
        return documents.map(this.documentToSession);
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

    /**
     * Ends a session by updating its finishedAt time, score, and answers.
     * @param id - The ID of the session to end.
     * @param finishedAt - The time when the session was finished.
     * @param score - The final score of the session.
     * @param answers - The answers provided during the session.
     * @returns The updated session, or null if not found.
     */
    async endSession(id: string, finishedAt: Date, score: number, answers: SessionAnswer[]): Promise<Session | null> {
        const session = await this.sessionModel.findByIdAndUpdate(
            id,
            {finishedAt, score, answers},
            {new: true}
        ).exec();
        if (!session) return null;
        return this.documentToSession(session);
    }

    /**
     * Updates the answers of a session.
     * @param sessionId - The ID of the session to update.
     * @param answers - The new answers to set for the session.
     * @returns The updated session, or null if not found.
     */
    async updateAnswers(sessionId: string, answers: SessionAnswer[]): Promise<Session | null> {
        const session = await this.sessionModel.findByIdAndUpdate(
            sessionId,
            {answers},
            {new: true}
        ).exec();
        if (!session) return null;
        return this.documentToSession(session);
    }

    /**
     * Pauses a session by updating its status to 'paused'.
     * @param id - The ID of the session to pause.
     * @returns The updated session, or null if not found.
     */
    async pauseSession(id: string): Promise<Session | null> {
        const session = await this.sessionModel.findByIdAndUpdate(
            id,
            {status: 'paused'},
            {new: true}
        ).exec();
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
        const session = await this.sessionModel.findByIdAndUpdate(
            id,
            {status: 'active'},
            {new: true}
        ).exec();
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
        const session = await this.sessionModel.findByIdAndUpdate(
            id,
            {status},
            {new: true}
        ).exec();
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