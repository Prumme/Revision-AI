import { QuizKpi } from '../../entities/kpi.entity';

export interface KpiRepository {
  getQuizKpi(quizId: string): Promise<QuizKpi>;
  // Tu pourras ajouter d'autres méthodes pour les thèmes, utilisateurs, etc.
}

