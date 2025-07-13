import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IDocumentRepository } from '@repositories/document.repository';
import { QuizDocument } from '@mongo/quiz/quiz.schema';
import {
  PaginatedResult,
  PaginationOptions,
} from '@repositories/user.repository';
import { UploadedDocument } from '@entities/document.entity';

@Injectable()
export class MongoDocumentRepository implements IDocumentRepository {
  constructor(
    @InjectModel('Quiz')
    private readonly quizModel: Model<QuizDocument>, // On créer des documents en utilisant le modèle Quiz
  ) {}

  findByIdentifier(string: string): Promise<UploadedDocument | null> {
    //alller chercher dans les quiz le premier document qui a l'identifiant
    return this.quizModel
      .findOne({ 'media.identifier': string }, { 'media.$': 1 })
      .then((quiz) => {
        if (!quiz || !quiz.media || quiz.media.length === 0) {
          return null;
        }
        return quiz.media[0] as UploadedDocument; // On retourne le premier document trouvé
      });
  }

  private async getPaginatedDocuments(
    pipeline: any[],
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<UploadedDocument>> {
    const { limit, page } = pagination;

    const paginationPipeline = [
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const documents = (await this.quizModel
      .aggregate([...pipeline, ...paginationPipeline])
      .exec()) as UploadedDocument[];

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
  ): Promise<PaginatedResult<UploadedDocument>> {
    const pipeline = [
      { $match: { _id: quizId } },
      { $project: { media: 1, _id: 0 } },
      { $unwind: '$media' },
      { $replaceRoot: { newRoot: '$media' } },
      { $group: { _id: '$checksum', doc: { $last: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
    ];

    return this.getPaginatedDocuments(pipeline, pagination);
  }

  async findByUserId(
    userId: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<UploadedDocument>> {
    const pipeline = [
      { $match: { userId: userId } },
      { $project: { media: 1, _id: 0 } },
      { $unwind: '$media' },
      { $replaceRoot: { newRoot: '$media' } },
      { $group: { _id: '$checksum', doc: { $last: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
    ];
    return this.getPaginatedDocuments(pipeline, pagination);
  }
}
