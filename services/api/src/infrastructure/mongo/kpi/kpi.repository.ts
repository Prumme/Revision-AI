import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Kpi } from '@entities/kpi.entity';
import { SessionDocument } from '../session/session.schema';
import { KpiRepository } from '@repositories/kpi.repository';

@Injectable()
export class MongoKpiRepository implements KpiRepository {
  constructor(
    @InjectModel('Session')
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async getQuizKpi(quizId: string): Promise<Kpi> {
    const sessions = await this.sessionModel
      .find({ quizId, status: 'finished' })
      .exec();
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
    const totalDuration = sessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0,
    );
    return {
      quizId,
      averageScore: totalScore / totalSessions,
      totalSessions,
      totalDuration,
      averageDuration: totalDuration / totalSessions,
    };
  }

  async getUserAverageScore(userId: string): Promise<number> {
    const sessions = await this.sessionModel
      .find({ userId, status: 'finished' })
      .exec();
    if (!sessions.length) return 0;
    const scoresInPercents = sessions
      .map((s) => {
        const base_score = s.answers.length;
        const score = s.score || 0;
        return base_score > 0 ? (score / base_score) * 100 : null;
      })
      .filter((s) => s !== null);

    const averageScorePercent =
      scoresInPercents.length > 0
        ? scoresInPercents.reduce((sum, val) => sum + val, 0) /
          scoresInPercents.length
        : 0;

    return averageScorePercent;
  }

  async getUserTotalRevisionTime(userId: string): Promise<number> {
    const sessions = await this.sessionModel
      .find({ userId, status: 'finished' })
      .exec();
    return sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  }
}
