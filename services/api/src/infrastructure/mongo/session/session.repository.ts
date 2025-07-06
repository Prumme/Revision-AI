import { Injectable } from "@nestjs/common";
import { SessionRepository } from "@repositories/session.repository";
import { InjectModel } from "@nestjs/mongoose";
import { SessionDocument } from "./session.schema";
import { Model } from 'mongoose';
import {Session, SessionAnswer, SessionStatus} from "@entities/session.entity";
import {SessionFiltersDto} from "@modules/session/dto/filter-session.dto";

@Injectable()
export class MongoSessionRepository implements SessionRepository {
  constructor(
    @InjectModel('Session')
    private readonly sessionModel: Model<SessionDocument>,
  ) { }

  async findById(id: string): Promise<Session | null> {
    const document = await this.sessionModel.findById(id).exec();
    if (!document) return null;
    return this.documentToSession(document);
  }

  async findAllByUserId(userId: string, filters?: SessionFiltersDto): Promise<Session[]> {
    const query: any = { userId };
    if (filters) {
      if (filters.status) query.status = filters.status;
      if (typeof filters.scoreMin === 'number') query.score = { ...query.score, $gte: filters.scoreMin };
      if (typeof filters.scoreMax === 'number') query.score = { ...query.score, $lte: filters.scoreMax };
    }
    const documents = await this.sessionModel.find(query).exec();
    return documents.map(this.documentToSession);
  }

  async create(session: Omit<Session, 'id'>): Promise<Session> {
    const document = await this.sessionModel.create(session);
    return this.documentToSession(document);
  }

  async startSession(id: string): Promise<Session | null> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  async endSession(id: string, finishedAt: Date, score: number, answers: SessionAnswer[]): Promise<Session | null> {
    const session = await this.sessionModel.findByIdAndUpdate(
      id,
      { finishedAt, score, answers },
      { new: true }
    ).exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  async updateAnswers(sessionId: string, answers: SessionAnswer[]): Promise<Session | null> {
    const session = await this.sessionModel.findByIdAndUpdate(
      sessionId,
      { answers },
      { new: true }
    ).exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  async pauseSession(id: string): Promise<Session | null> {
    const session = await this.sessionModel.findByIdAndUpdate(
      id,
      { status: 'paused' },
      { new: true }
    ).exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  async resumeSession(id: string): Promise<Session | null> {
    const session = await this.sessionModel.findByIdAndUpdate(
      id,
      { status: 'active' },
      { new: true }
    ).exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

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