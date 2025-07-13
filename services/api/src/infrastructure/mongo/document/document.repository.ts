import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IDocumentRepository } from '@repositories/document.repository';
import { QuizDocument } from '@mongo/quiz/quiz.schema';
import {
  PaginatedResult,
  PaginationOptions,
} from '@repositories/user.repository';

@Injectable()
export class MongoDocumentRepository implements IDocumentRepository {
  constructor(
    @InjectModel('Quiz')
    private readonly quizModel: Model<QuizDocument>, // On créer des documents en utilisant le modèle Quiz
  ) {}

  private async getPaginatedDocuments(
    pipeline: any[],
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Document>> {
    const { limit, page } = pagination;

    const paginationPipeline = [
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const documents = (await this.quizModel
      .aggregate([...pipeline, ...paginationPipeline])
      .exec()) as Document[];

    const totalCountResult = await this.quizModel
      .aggregate([...pipeline, { $count: 'total' }])
      .exec();

    const total = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0; // Gérer le cas où total est 0

    return {
      data: documents,
      total,
      page,
      totalPages,
      limit,
    };
  }

  async findByQuizId(
    quizId: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Document>> {
    const pipeline = [
      { $match: { _id: quizId } },
      { $project: { medias: 1, _id: 0 } },
      { $unwind: '$medias' },
      { $replaceRoot: { newRoot: '$medias' } },
    ];

    return this.getPaginatedDocuments(pipeline, pagination);
  }

  async findByUserId(
    userId: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Document>> {
    const pipeline = [
      { $match: { userId: userId } },
      { $unwind: '$medias' },
      { $replaceRoot: { newRoot: '$medias' } },
    ];

    return this.getPaginatedDocuments(pipeline, pagination);
  }
}
