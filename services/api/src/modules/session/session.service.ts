import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../../entities/session.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async create(data: Partial<Session>): Promise<Session> {
    const session = new this.sessionModel({ ...data, id: uuidv4(), startedAt: new Date() });
    return session.save();
  }

  async findAll(): Promise<Session[]> {
    return this.sessionModel.find().exec();
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionModel.findOne({ id }).exec();
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async update(id: string, data: Partial<Session>): Promise<Session> {
    const session = await this.sessionModel.findOneAndUpdate({ id }, data, { new: true }).exec();
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async remove(id: string): Promise<void> {
    const res = await this.sessionModel.deleteOne({ id }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Session not found');
  }

  // Méthode spécifique : démarrer une session
  async startSession(quizId: string, userId: string): Promise<Session> {
    const session = new this.sessionModel({
      id: uuidv4(),
      quizId,
      userId,
      score: 0,
      startedAt: new Date(),
      finishedAt: null,
      answers: [],
    });
    return session.save();
  }

  // Méthode spécifique : terminer une session
  async finishSession(id: string, score: number, answers: { correct: boolean; a: string }[]): Promise<Session> {
    const session = await this.sessionModel.findOneAndUpdate(
      { id },
      { finishedAt: new Date(), score, answers },
      { new: true },
    ).exec();
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }
}

