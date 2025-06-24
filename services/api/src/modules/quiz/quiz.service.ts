import { Quiz } from '@entities/quiz.entity';
import { RabbitMQQueueProvider } from '@infrastructure/queue/queueProvider';
import { MinioService } from '@modules/minio/minio.service';
import { Inject, Injectable } from '@nestjs/common';
import { QuizRepository } from '@repositories/quiz.repository';
import {
  UserRepository
} from '@repositories/user.repository';
import { QueueProvider } from '@services/QueueProvider';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  private readonly queueProvider: QueueProvider<any>;

  constructor(
    @Inject('QuizRepository')
    private readonly quizRepository: QuizRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly minioService: MinioService,
  ) {
    this.queueProvider = RabbitMQQueueProvider;
  }

  async findById(id: string): Promise<Quiz | null> {
    return this.quizRepository.findById(id);
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizRepository.findAll();
  }

  async create(
    quiz: CreateQuizDto,
    files: Express.Multer.File[],
  ): Promise<Quiz> {
    const foundUser = await this.userRepository.findById(quiz.userId);
    if (!foundUser) {
      throw new Error('Utilisateur non trouvé');
    }

    const mediaFiles: string[] = [];

    // Fix: Create a correct quiz object by keeping userId and converting dates to timestamps
    const newQuiz: Omit<Quiz, 'id'> = {
      userId: quiz.userId,
      title: quiz.title,
      category: quiz.category,
      questions: [],
      questionsNumbers: quiz.questionsNumbers,
      description: quiz.description,
      isPublic: quiz.isPublic,
      media: mediaFiles,
      status: 'pending', // Default status
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdQuiz = await this.quizRepository.create(newQuiz);

    const jobs = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const fileExtension = file.originalname.split('.').pop();
        const objectName = `${quiz.userId}/quiz-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
        const fullPath = 'documents/' + objectName;

        // Upload file to MinIO
        await this.minioService.uploadFile(file, fullPath);

        // RabbitMQ queue for file uploaded event
        jobs.push(
          this.queueProvider('file-uploaded', {
            bucketName: this.minioService.bucketName,
            objectKey: fullPath,
            fileName: fullPath,
            meta: {
              quizId: createdQuiz.id,
              userId: quiz.userId,
            },
          }),
        );

        mediaFiles.push(objectName);
      }
    }

    await Promise.all(jobs);

    return createdQuiz;
  }

  async update(id: string, quiz: UpdateQuizDto): Promise<Quiz> {
    return this.quizRepository.update(id, quiz);
  }

  async delete(id: string): Promise<boolean> {
    return this.quizRepository.delete(id);
  }
}
