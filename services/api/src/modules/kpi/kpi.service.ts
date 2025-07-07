import { Injectable, Inject } from '@nestjs/common';
import { KpiRepository } from '../../domain/repositories/kpi.repository';
import { QuizKpi } from '../../domain/entities/kpi.entity';

@Injectable()
export class KpiService {
  constructor(
    @Inject('KpiRepository')
    private readonly kpiRepository: KpiRepository,
  ) {}

  async getQuizKpi(quizId: string): Promise<QuizKpi> {
    return this.kpiRepository.getQuizKpi(quizId);
  }
}

