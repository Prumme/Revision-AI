import { Inject, Injectable } from '@nestjs/common';
import { Quiz } from '@entities/quiz.entity';
import { QuizRepository } from '@repositories/quiz.repository';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @Inject('QuizRepository')
    private readonly quizRepository: QuizRepository,
  ) {}

  async findById(id: string): Promise<Quiz | null> {
    return this.quizRepository.findById(id);
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizRepository.findAll();
  }

  async create(quiz: CreateQuizDto): Promise<Quiz> {
    return this.quizRepository.create(quiz);
  }

  async update(id: string, quiz: UpdateQuizDto): Promise<Quiz> {
    return this.quizRepository.update(id, quiz);
  }

  async delete(id: string): Promise<boolean> {
    return this.quizRepository.delete(id);
  }
}
