import { ApiService } from './api.service';

export class KpiService {
  static async getUserAverageScore(userId: string): Promise<number> {
    const response = await ApiService.get<{ averageScore: number }>(`/kpi/user/${userId}/average-score`);
    return response.data.averageScore;
  }

  static async getUserTotalRevisionTime(userId: string): Promise<string> {
    const response = await ApiService.get<{ totalRevisionTime: string }>(`/kpi/user/${userId}/total-revision-time`);
    return response.data.totalRevisionTime;
  }
}
