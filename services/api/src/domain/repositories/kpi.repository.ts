import { Kpi } from '../entities/kpi.entity';

export interface KpiRepository {
  getQuizKpi(quizId: string): Promise<Kpi>;
  getUserAverageScore(userId: string): Promise<number>;
  getUserTotalRevisionTime(userId: string): Promise<number>;
}
