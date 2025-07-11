import { Injectable, Inject } from '@nestjs/common';
import { Report } from '../../domain/entities/report.entity';
import {
  IReportRepository,
  GetReportsParams,
} from '../../domain/repositories/report.repository';
import { CreateReportDto } from './dto/create-report.dto';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class ReportService {
  constructor(
    @Inject('ReportRepository')
    private readonly reportRepository: IReportRepository,
    private readonly userService: UserService,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const user = await this.userService.findById(createReportDto.reporterId);

    // Chercher un signalement existant non résolu
    const existingReport = await this.reportRepository.findOne({
      type: createReportDto.type,
      targetId: createReportDto.targetId,
      resolved: false,
    });

    if (existingReport) {
      // Ajouter une nouvelle raison au signalement existant
      existingReport.reasons.push({
        userId: user.id,
        userName: user.username,
        reason: createReportDto.reason,
        createdAt: new Date(),
      });
      existingReport.updatedAt = new Date();
      return this.reportRepository.save(existingReport);
    }

    // Créer un nouveau signalement
    return this.reportRepository.create({
      type: createReportDto.type,
      targetId: createReportDto.targetId,
      targetName: createReportDto.targetName,
      reasons: [
        {
          userId: user.id,
          userName: user.username,
          reason: createReportDto.reason,
          createdAt: new Date(),
        },
      ],
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findAll(
    params: GetReportsParams,
  ): Promise<{ reports: Report[]; total: number }> {
    return this.reportRepository.findAll(params);
  }

  async findOne(id: string): Promise<Report> {
    return this.reportRepository.findById(id);
  }

  async resolve(id: string, userId: string): Promise<Report> {
    const report = await this.reportRepository.resolve(id, userId);
    if (!report) {
      throw new Error('Report not found');
    }
    return report;
  }
}
