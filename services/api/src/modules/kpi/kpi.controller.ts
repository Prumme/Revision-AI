import { Controller, Get, Param } from '@nestjs/common';
import { KpiService } from './kpi.service';
import { Kpi } from '../../domain/entities/kpi.entity';

@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Get('quiz/:quizId')
  async getQuizKpi(@Param('quizId') quizId: string): Promise<Kpi> {
    return this.kpiService.getQuizKpi(quizId);
  }

  @Get('user/:userId/average-score')
  async getUserAverageScore(@Param('userId') userId: string): Promise<{ averageScore: number }> {
    const averageScore = await this.kpiService.getUserAverageScore(userId);
    return { averageScore };
  }

  @Get('user/:userId/total-revision-time')
  async getUserTotalRevisionTime(@Param('userId') userId: string): Promise<{ totalRevisionTime: string }> {
    const totalRevisionTime = await this.kpiService.getUserTotalRevisionTime(userId);
    console.log(`Total revision time for user ${userId}: ${totalRevisionTime}`);
    return { totalRevisionTime };
  }
}
