import { Quiz } from '@entities/quiz.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  NullPaginationOptions,
  QuizFilters,
  QuizRepository,
} from '@repositories/quiz.repository';
import { Model, Types } from 'mongoose';
import { QuizDocument } from './quiz.schema';
import {
  PaginatedResult,
  PaginationOptions,
} from '@repositories/user.repository';

@Injectable()
export class MongoQuizRepository implements QuizRepository {
  constructor(
    @InjectModel('Quiz')
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  async findById(id: string): Promise<Quiz | null> {
    const document = await this.quizModel.findById(id).exec();
    if (!document) return null;
    return this.documentToQuiz(document);
  }

  private _createQuery(filters?: QuizFilters): any {
    const query: any = {};
    if (filters) {
      if (filters.ready) {
        query.questions = { $exists: true, $ne: [] };
      }
      if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
        query.$or = [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
        ];
      }
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.isPublic !== undefined) {
        query.isPublic =
          filters.isPublic === 'true' || filters.isPublic === true;
      }
      if (filters.userId) {
        if (filters.userId.exclude) {
          query.userId = { $ne: new Types.ObjectId(filters.userId.id) };
        } else {
          query.userId = { $eq: new Types.ObjectId(filters.userId.id) };
        }
      }
    }
    return query;
  }

  async findAll(
    filters?: QuizFilters,
    pagination?: PaginationOptions | NullPaginationOptions,
  ): Promise<PaginatedResult<Quiz>> {
    const query = this._createQuery({
      ...filters,
      ready: true, //want only quizzes that are parsed and has questions
    });

    let mongoQuery = this.quizModel.find(query);

    if (!('ignore' in pagination)) {
      mongoQuery = mongoQuery
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit);
    }

    if (filters?.sortBy) {
      const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
      mongoQuery = mongoQuery.sort({ [filters.sortBy]: sortOrder });
    } else {
      mongoQuery = mongoQuery.sort({ createdAt: -1 }); // Default sort by createdAt desc
    }

    const [documents, total] = await Promise.all([
      mongoQuery.exec(),
      this.quizModel.countDocuments(query).exec(),
    ]);

    if ('ignore' in pagination) {
      return {
        data: documents.map(this.documentToQuiz.bind(this)),
        total,
        page: 1,
        limit: -1,
        totalPages: 1,
      };
    } else {
      return {
        data: documents.map(this.documentToQuiz.bind(this)),
        total: total,
        page: pagination.page,
        limit: pagination?.limit || 10,
        totalPages: Math.ceil(total / (pagination?.limit || 10)),
      };
    }
  }

  async create(quiz: Quiz): Promise<Quiz> {
    const document = await this.quizModel.create(quiz);
    return this.documentToQuiz(document);
  }

  async update(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
    const document = await this.quizModel
      .findByIdAndUpdate(id, quiz, { new: true })
      .exec();
    return this.documentToQuiz(document);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.quizModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.quizModel.countDocuments({ userId }).exec();
  }

  async countCreatedToday(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return this.quizModel
      .countDocuments({
        userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();
  }

  private documentToQuiz(document: QuizDocument): Quiz {
    return {
      id: document._id.toString(),
      userId: document.userId,
      username: document.username,
      title: document.title,
      category: document.category,
      questions: document.questions.map((q) => ({
        q: q.q,
        answers: q.answers.map((a) => ({
          a: a.a,
          c: a.c,
        })),
      })),
      questionsNumbers: document.questionsNumbers,
      description: document.description,
      isPublic: document.isPublic,
      media: document.media,
      // status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
