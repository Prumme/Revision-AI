import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { KpiRepository } from '../../../domain/repositories/kpi.repository';
import { QuizKpi } from '../../../domain/entities/kpi.entity';
import { SessionDocument } from '../session/session.schema';

@Injectable()
export class MongoKpiRepository implements KpiRepository {
  constructor(
    @InjectModel('Session')
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async getQuizKpi(quizId: string): Promise<QuizKpi> {
    const sessions = await this.sessionModel.find({ quizId, status: 'finished' }).exec();
    const totalSessions = sessions.length;
    if (totalSessions === 0) {
      return {
        quizId,
        averageScore: 0,
        totalSessions: 0,
        totalDuration: 0,
        averageDuration: 0,
      };
    }
    const totalScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return {
      quizId,
      averageScore: totalScore / totalSessions,
      totalSessions,
      totalDuration,
      averageDuration: totalDuration / totalSessions,
    };
  }
}

