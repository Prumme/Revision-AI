import { Quiz } from '@entities/quiz.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QuizRepository } from '@repositories/quiz.repository';
import { Model, Types } from 'mongoose';
import { QuizDocument } from './quiz.schema';

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

  async findAll(filters?: any, pagination?: any): Promise<Quiz[]> {
    const query: any = { status: 'completed' };
    if (filters) {
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
        query.isPublic = filters.isPublic === 'true' || filters.isPublic === true;
      }
      if (filters.userId) {
        query.userId = { $ne: filters.userId };
      }
    }
    let mongoQuery = this.quizModel.find(query);
    if (pagination) {
      if (pagination.skip) mongoQuery = mongoQuery.skip(pagination.skip);
      if (pagination.limit) mongoQuery = mongoQuery.limit(pagination.limit);
    }
    const documents = await mongoQuery.exec();
    return documents.map(this.documentToQuiz);
  }

  async findAllByUserId(userId: string, filters?: any): Promise<Quiz[]> {
    const query: any = { userId };
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
    }
    const documents = await this.quizModel.find(query).exec();
    return documents.map(this.documentToQuiz);
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
    if (!userId) {
        throw new Error('User ID is required to count quizzes.');
    }
    return this.quizModel.countDocuments({ userId: userId }).exec();
  }
  private documentToQuiz(document: QuizDocument): Quiz {
    return {
      id: document._id.toString(),
      userId: document.userId,
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
