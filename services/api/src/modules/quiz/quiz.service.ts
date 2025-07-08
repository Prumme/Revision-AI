import { Quiz } from '@entities/quiz.entity';
import { MinioService } from '@modules/minio/minio.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { QuizRepository } from '@repositories/quiz.repository';
import { UserRepository } from '@repositories/user.repository';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizUseCaseFactory } from '../../domain/usecases/QuizGenerationUseCase';
import { QuizGenerationJobRepository } from '@repositories/quiz-generation-job.repository';
import { CachedFileParsedRepository } from '@repositories/cached-file-parsed.repository';
import { QueueProvider } from '@services/QueueProvider';
import { FileToParseDTO } from '../../types/FileToParseDTO';
import { QuizGenerationDTO } from '../../types/QuizGenerationDTO';
import * as crypto from 'node:crypto';
import { QuizQuotaService } from './quiz-quota.service';
import { SubscriptionTier } from './subscription-tiers.config';

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
    private readonly minioService: MinioService,
    @Inject('FileUploadedQueueProvider')
    private readonly fileUploadedQueueProvider: QueueProvider<FileToParseDTO>,
    @Inject('QuizGenerationQueueProvider')
    private readonly quizGenerationQueueProvider: QueueProvider<QuizGenerationDTO>,
    private readonly quizQuotaService: QuizQuotaService,
  ) {}

  async findById(id: string): Promise<Quiz | null> {
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) return null;
    // Normalisation du format des questions pour le frontend
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

  async findAll(): Promise<Quiz[]> {
    return this.quizRepository.findAll();
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

    // Validation des quotas selon le tier de l'utilisateur
    await this.quizQuotaService.validateQuotaOrThrow(
      quiz.userId,
      foundUser.subscriptionTier as SubscriptionTier,
      quiz,
    );

    const medias = [];
    const fileContents: string[] = [];
    /** Upload files to S3 et récupération du contenu */
    for (const file of files) {
      const fileExtension = file.originalname.split('.').pop();
      const hashedFileName = crypto
        .createHash('md5')
        .update(file.originalname)
        .digest('hex');
      const objectName = `${quiz.userId}/quiz-${hashedFileName}.${fileExtension}`;
      const fullPath = 'documents/' + objectName;
      await this.minioService.uploadFile(file, fullPath);
      medias.push(fullPath);
      // Récupérer le contenu du fichier (en supposant que getFile renvoie un buffer ou string)
      const fileData = await this.minioService.getFile(fullPath);
      // Si Buffer, convertir en string
      fileContents.push(fileData?.toString ? fileData.toString('utf-8') : String(fileData));
    }

    quiz.medias = medias;

    // Concaténer tous les contenus pour la vérification du quota de tokens
    const allText = fileContents.join(' ');
    await this.quizQuotaService.validateQuotaOrThrow(
      quiz.userId,
      foundUser.subscriptionTier as SubscriptionTier,
      quiz,
      allText,
    );

    const useCase = CreateQuizUseCaseFactory(
      this.quizRepository,
      this.quizGenerationJobRepository,
      this.cachedFileParsedRepository,
      this.minioService,
      this.fileUploadedQueueProvider,
      this.quizGenerationQueueProvider,
    );

    const createdQuiz = await useCase(quiz);

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
        if (typeof a.correct === 'boolean') cValue = a.correct;
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
}
