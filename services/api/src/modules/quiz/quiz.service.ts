import { Quiz } from '@entities/quiz.entity';
import { ForbiddenException } from '@nestjs/common';
import { MinioService } from '@modules/minio/minio.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { QuizFilters, QuizRepository } from '@repositories/quiz.repository';
import {
  PaginatedResult,
  PaginationOptions,
  UserRepository,
} from '@repositories/user.repository';
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
      questions: (quiz.questions || []).map((q) => ({
        q: q.q,
        answers: (q.answers || []).map((a) => ({
          a: a.a,
          c: typeof a.c === 'boolean' ? a.c : false,
        })),
      })),
    };
  }

  async findAll(
    filters?: QuizFilters,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<Quiz>> {
    return this.quizRepository.findAll(filters, pagination);
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
    quiz.username = foundUser.username;

    const userTier = (foundUser.subscriptionTier || 'free') as SubscriptionTier;

    const useCase = CreateQuizUseCaseFactory(
      this.quizRepository,
      this.quizGenerationJobRepository,
      this.cachedFileParsedRepository,
      this.fileService,
      this.fileUploadedQueueProvider,
      this.quizGenerationQueueProvider,
      this.subscriptionPolicyService,
      userTier,
    );

    const createdQuiz = await useCase(quiz);

    if (createdQuiz instanceof ForbiddenException) {
      this.logger.error(`Création de quiz interdite: ${createdQuiz.message}`);
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

  async updateUsernameInUserQuizzes(
    userId: string,
    newUsername: string,
  ): Promise<void> {
    this.logger.log(
      `Mise à jour du username dans tous les quiz pour l'utilisateur ${userId}`,
    );

    try {
      // Récupérer tous les quiz de l'utilisateur
      const userQuizzes = await this.quizRepository.findAll(
        {
          userId: { id: userId },
        },
        undefined,
      );

      if (userQuizzes.data.length === 0) {
        this.logger.log(`Aucun quiz trouvé pour l'utilisateur ${userId}`);
        return;
      }

      // Mettre à jour chaque quiz avec le nouveau username
      const updatePromises = userQuizzes.data.map((quiz) =>
        this.quizRepository.update(quiz.id, { username: newUsername }),
      );

      await Promise.all(updatePromises);

      this.logger.log(
        `Username mis à jour dans ${userQuizzes.data.length} quiz(s) pour l'utilisateur ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour du username dans les quiz pour l'utilisateur ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async countByUserId(userId: string): Promise<number> {
    return this.quizRepository.countByUserId(userId);
  }
}
