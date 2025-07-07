import { Controller, Get, Param } from '@nestjs/common';
import { KpiService } from './kpi.service';
import { QuizKpi } from '../../domain/entities/kpi.entity';

@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Get('quiz/:quizId')
  async getQuizKpi(@Param('quizId') quizId: string): Promise<QuizKpi> {
    return this.kpiService.getQuizKpi(quizId);
  }
}

