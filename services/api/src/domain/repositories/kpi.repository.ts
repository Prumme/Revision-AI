import { QuizKpi } from '../../entities/kpi.entity';

export interface KpiRepository {
  getQuizKpi(quizId: string): Promise<QuizKpi>;
  getUserAverageScore(userId: string): Promise<number>;
  getUserTotalRevisionTime(userId: string): Promise<number>;
}
