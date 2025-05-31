import { Injectable } from '@nestjs/common';
import { QuizRepository } from '@repositories/quiz.repository';
import { Quiz } from '@entities/quiz.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MongoQuizRepository implements QuizRepository {
  constructor(
    @InjectModel('Quiz')
    private readonly quizModel: Model<Quiz>,
  ) {}

  async findById(id: string): Promise<Quiz | null> {
    return this.quizModel.findById(id).exec();
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizModel.find().exec();
  }

  async create(quiz: Omit<Quiz, 'id'>): Promise<Quiz> {
    const createdQuiz = new this.quizModel(quiz);
    return createdQuiz.save();
  }

  async update(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
    return this.quizModel.findByIdAndUpdate(id, quiz, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.quizModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
