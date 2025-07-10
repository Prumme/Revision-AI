import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Report } from '../../../domain/entities/report.entity';
import {
  IReportRepository,
  GetReportsParams,
} from '../../../domain/repositories/report.repository';

@Injectable()
export class MongoReportRepository implements IReportRepository {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<Report>,
  ) {}

  async findById(id: string): Promise<Report | null> {
    return this.reportModel.findById(id).exec();
  }

  async findOne(filter: FilterQuery<Report>): Promise<Report | null> {
    return this.reportModel.findOne(filter).exec();
  }

  async create(report: Partial<Report>): Promise<Report> {
    const newReport = new this.reportModel(report);
    return newReport.save();
  }

  async save(report: Report): Promise<Report> {
    return this.reportModel
      .findByIdAndUpdate(report._id, report, { new: true })
      .exec();
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

    // Recherche sur le nom de l'élément signalé
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.or([
        { targetName: searchRegex },
        { 'reasons.reason': searchRegex },
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
      this.reportModel
        .countDocuments({
          resolved,
          ...(search && search.trim()
            ? {
                $or: [
                  { targetName: { $regex: search.trim(), $options: 'i' } },
                  {
                    'reasons.reason': { $regex: search.trim(), $options: 'i' },
                  },
                ],
              }
            : {}),
        })
        .exec(),
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
