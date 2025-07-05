import { Injectable } from "@nestjs/common";
import { SessionRepository } from "@repositories/session.repository";
import { InjectModel } from "@nestjs/mongoose";
import { SessionDocument } from "./session.schema";
import { Model } from 'mongoose';
import { Session } from "@entities/session.entity";

@Injectable()
export class MongoSessionRepository implements SessionRepository {
  constructor(
    @InjectModel('Session')
    private readonly sessionModel: Model<SessionDocument>,
  ) { }

  async findById(id: string): Promise<Session | null> {
    // Use _id for MongoDB default id
    const document = await this.sessionModel.findById(id).exec();
    if (!document) return null;
    return this.documentToSession(document);
  }

  async findAllByUserId(userId: string): Promise<Session[]> {
    const documents = await this.sessionModel.find({ userId }).exec();
    return documents.map(this.documentToSession);
  }

  async create(session: Omit<Session, 'id'>): Promise<Session> {
    const sessionDocument = new this.sessionModel(session);
    const savedSession = await sessionDocument.save();
    return this.documentToSession(savedSession);
  }

  async startSession(id: string): Promise<Session | null> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  async endSession(id: string, finishedAt: Date, score: number, answers: { correct: boolean; a: string }[]): Promise<Session | null> {
    const session = await this.sessionModel.findByIdAndUpdate(
      id,
      { finishedAt, score, answers },
      { new: true }
    ).exec();
    if (!session) return null;
    return this.documentToSession(session);
  }

  async updateAnswers(sessionId: string, answers: any[]): Promise<Session | null> {
    const session = await this.sessionModel.findByIdAndUpdate(
      sessionId,
      { answers },
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
      answers: document.answers,
    };
  }
}