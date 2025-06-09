import { Injectable } from '@nestjs/common';
import { QuizRepository } from '@repositories/quiz.repository';
import { Quiz } from '@entities/quiz.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
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

  async findAll(): Promise<Quiz[]> {
    const documents = await this.quizModel.find().exec();
    return documents.map(this.documentToQuiz);
  }

  async create(quiz: Omit<Quiz, 'id'>): Promise<Quiz> {
    const createdQuiz = new this.quizModel(quiz);
    const document = await createdQuiz.save();
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

  private documentToQuiz(document: QuizDocument): Quiz {
    return {
      id: document._id.toString(),
      ...document,
    };
  }
}
