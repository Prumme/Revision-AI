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

  async getUserAverageScore(userId: string): Promise<number> {
    const avg = await this.kpiRepository.getUserAverageScore(userId);
    return Math.round(avg * 100);
  }

  async getUserTotalRevisionTime(userId: string): Promise<string> {
    const seconds = await this.kpiRepository.getUserTotalRevisionTime(userId);
    if (seconds < 60) return `${seconds} minutes`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours < 24) return minutes > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${hours}h`;
    const days = Math.floor(hours / 24);
    const restHours = hours % 24;
    return restHours > 0 ? `${days}j${restHours}h` : `${days}j`;
  }
}
