import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report } from '../entities/report.entity';
import { FilterQuery } from 'mongoose';

export interface GetReportsParams {
  resolved?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IReportRepository {
  findById(id: string): Promise<Report | null>;
  findOne(filter: FilterQuery<Report>): Promise<Report | null>;
  create(report: Partial<Report>): Promise<Report>;
  save(report: Report): Promise<Report>;
  findAll(
    params: GetReportsParams,
  ): Promise<{ reports: Report[]; total: number }>;
  resolve(id: string, userId: string): Promise<Report | null>;
}

@Injectable()
export class ReportRepository implements IReportRepository {
  constructor(@InjectModel(Report.name) private reportModel: Model<Report>) {}

  async create(report: Partial<Report>): Promise<Report> {
    const createdReport = new this.reportModel(report);
    return createdReport.save();
  }

  async findById(id: string): Promise<Report | null> {
    return this.reportModel.findById(id).exec();
  }

  async findOne(filter: FilterQuery<Report>): Promise<Report | null> {
    return this.reportModel.findOne(filter).exec();
  }

  async save(report: Report): Promise<Report> {
    return report.save();
  }

  async findAll(
    params: GetReportsParams,
  ): Promise<{ reports: Report[]; total: number }> {
    const {
      resolved = false,
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const query = this.reportModel.find({ resolved });

    // Recherche
    if (search) {
      query.or([
        { targetName: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ]);
    }

    // Tri
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    query.sort(sort);

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).limit(limit);

    // Exécuter les requêtes en parallèle
    const [reports, total] = await Promise.all([
      query.exec(),
      this.reportModel.countDocuments({ resolved }).exec(),
    ]);

    return { reports, total };
  }

  async resolve(id: string, userId: string): Promise<Report | null> {
    return this.reportModel
      .findByIdAndUpdate(
        id,
        {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy: userId,
        },
        { new: true },
      )
      .exec();
  }
}
