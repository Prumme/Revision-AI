import { Kpi } from '../entities/kpi.entity';
import { MongoKpiRepository } from '@mongo/kpi/kpi.repository';

export interface KpiRepository {
  getQuizKpi(quizId: string): Promise<Kpi>;
  getUserAverageScore(userId: string): Promise<number>;
  getUserTotalRevisionTime(userId: string): Promise<number>;
}

export const KpiRepositoryProvider = {
  provide: 'KpiRepository',
  useClass: MongoKpiRepository,
};
