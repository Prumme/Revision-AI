import { Quiz } from '@entities/quiz.entity';
import { ForbiddenException } from '@nestjs/common';
import { MinioService } from '@modules/minio/minio.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { QuizRepository } from '@repositories/quiz.repository';
import { UserRepository } from '@repositories/user.repository';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizUseCaseFactory } from '@domain/usecases/QuizGenerationUseCase';
import { QuizGenerationJobRepository } from '@repositories/quiz-generation-job.repository';
import { CachedFileParsedRepository } from '@repositories/cached-file-parsed.repository';
import { QueueProvider } from '@services/QueueProvider';
import { FileToParseDTO } from '../../types/FileToParseDTO';
import { QuizGenerationDTO } from '../../types/QuizGenerationDTO';
import * as crypto from 'node:crypto';
import { SubscriptionPolicyService } from '../../domain/policies/SubscriptionPolicyService';
import { SubscriptionTier } from '@domain/policies/SubscriptionPolicy';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  constructor(
    @Inject('QuizRepository')
    private readonly quizRepository: QuizRepository,
    @Inject('QuizGenerationJobRepository')
    private readonly quizGenerationJobRepository: QuizGenerationJobRepository,
    @Inject('CachedFileParsedRepository')
    private readonly cachedFileParsedRepository: CachedFileParsedRepository, // TODO: Replace with actual type
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly fileService: MinioService,
    @Inject('FileUploadedQueueProvider')
    private readonly fileUploadedQueueProvider: QueueProvider<FileToParseDTO>,
    @Inject('QuizGenerationQueueProvider')
    private readonly quizGenerationQueueProvider: QueueProvider<QuizGenerationDTO>,
    private readonly subscriptionPolicyService: SubscriptionPolicyService,
  ) {}

  async findById(id: string): Promise<Quiz | null> {
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) return null;
    return {
      ...quiz,
      questions: (quiz.questions || []).map(q => ({
        q: q.q,
        answers: (q.answers || []).map(a => ({
          a: a.a,
          c: typeof a.c === 'boolean' ? a.c : false,
        }))
      }))
    };
  }

  async findAll(filters?: any, userId?: string): Promise<Quiz[]> {
    if (userId) filters = { ...filters, userId };
    return this.quizRepository.findAll(filters, undefined);
  }

  async findAllByUserId(userId: string, filters?: any): Promise<Quiz[]> {
    return this.quizRepository.findAllByUserId(userId, filters);
  }

  async create(
    quiz: CreateQuizDto,
    files: Express.Multer.File[],
  ): Promise<Quiz> {
    this.logger.log('Début de la création du quiz');
    const foundUser = await this.userRepository.findById(quiz.userId);
    if (!foundUser) {
      throw new Error('Utilisateur non trouvé');
    }

    const medias = [];
    /** Upload files to S3 */
    for (const file of files) {
      const fileExtension = file.originalname.split('.').pop();
      const hashedFileName = crypto
        .createHash('md5')
        .update(file.originalname)
        .digest('hex');
      const objectName = `${quiz.userId}/quiz-${hashedFileName}.${fileExtension}`;
      const fullPath = 'documents/' + objectName;
      await this.fileService.uploadFile(file, fullPath);
      medias.push(fullPath);
    }

    quiz.medias = medias;

    const userTier = (foundUser.subscriptionTier || 'free') as SubscriptionTier;

    const useCase = CreateQuizUseCaseFactory(
      this.quizRepository,
      this.quizGenerationJobRepository,
      this.cachedFileParsedRepository,
      this.fileService, // Pass FileService instead of minioService
      this.fileUploadedQueueProvider,
      this.quizGenerationQueueProvider,
      this.subscriptionPolicyService,
      userTier
    );

    const createdQuiz = await useCase(quiz);

    if (createdQuiz instanceof ForbiddenException) {
      this.logger.error(
        `Création de quiz interdite: ${createdQuiz.message}`,
      );
      throw createdQuiz;
    }

    if (createdQuiz instanceof Error) {
      this.logger.error(
        `Erreur lors de la création du quiz: ${createdQuiz.message}`,
      );
      throw createdQuiz;
    }

    this.logger.log(`Quiz créé avec succès: ${createdQuiz.id}`);
    return createdQuiz;
  }

  async update(id: string, quiz: UpdateQuizDto): Promise<Quiz> {
    this.logger.log(
      `Mise à jour du quiz ${id} avec les données suivantes:`,
      JSON.stringify(quiz),
    );

    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions = quiz.questions.map((q) => ({
        ...q,
        answers: (q.answers || []).map((a) => {
          let cValue = a.c;
          if (typeof a.c === 'boolean') cValue = a.c;
          return {
            ...a,
            c: typeof cValue === 'boolean' ? cValue : false,
          };
        }),
      }));
      this.logger.log(
        `Quiz ${id} mis à jour avec ${quiz.questions.length} questions`,
      );
      this.logger.log(`Première question: ${quiz.questions[0].q}`);
      this.logger.log(
        `Nombre de réponses: ${quiz.questions[0].answers.length}`,
      );
    }

    if (quiz.status) {
      this.logger.log(`Statut du quiz mis à jour: ${quiz.status}`);
    }

    return this.quizRepository.update(id, quiz);
  }

  async updateQuizQuestionsFromQueue(
    quizId: string,
    questions: any[],
  ): Promise<void> {
    this.logger.log(
      `Mise à jour du quiz ${quizId} avec les questions depuis la queue quiz-generated`,
    );
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      this.logger.error(`Quiz non trouvé pour l'id: ${quizId}`);
      return;
    }
    // Normalisation du champ c pour chaque réponse, accepte aussi 'correct' (Mongo schema)
    const normalizedQuestions = (questions || []).map((q) => ({
      ...q,
      answers: (q.answers || []).map((a) => {
        let cValue = a.c;
        if (typeof a.c === 'boolean') cValue = a.c;
        return {
          ...a,
          c: typeof cValue === 'boolean' ? cValue : false,
        };
      }),
    }));
    quiz.questions = normalizedQuestions;
    // quiz.status = 'completed';
    quiz.updatedAt = new Date();
    await this.quizRepository.update(quizId, quiz);
    this.logger.log(
      `Quiz ${quizId} mis à jour avec ${questions.length} questions.`,
    );
  }

  async delete(id: string): Promise<boolean> {
    return this.quizRepository.delete(id);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.quizRepository.countByUserId(userId);
  }
}
