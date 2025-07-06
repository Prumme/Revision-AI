import { Quiz } from '@entities/quiz.entity';
import { QueueProvider } from '@infrastructure/queue/queueProvider';
import { MinioService } from '@modules/minio/minio.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { QuizRepository } from '@repositories/quiz.repository';
import {
  UserRepository
} from '@repositories/user.repository';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  constructor(
    @Inject('QuizRepository')
    private readonly quizRepository: QuizRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly minioService: MinioService,
    @Inject('QueueProvider')
    private readonly queueProvider: typeof QueueProvider,
  ) { }

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
    return this.quizRepository.findAll(filters, userId);
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

    const mediaFiles: string[] = [];

    const questionsNumbers = typeof quiz.questionsNumbers === 'string'
      ? Number(quiz.questionsNumbers)
      : quiz.questionsNumbers;
    const isPublic = typeof quiz.isPublic === 'string'
      ? quiz.isPublic === 'true' || quiz.isPublic === '1'
      : !!quiz.isPublic;
    const newQuiz: Omit<Quiz, 'id'> = {
      userId: quiz.userId,
      title: quiz.title,
      category: quiz.category,
      questions: [],
      questionsNumbers,
      description: quiz.description,
      isPublic,
      media: [],
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.logger.log('Création du quiz dans MongoDB');
    const createdQuiz = await this.quizRepository.create(newQuiz);
    this.logger.log(`Quiz créé avec ID: ${createdQuiz.id}`);

    const jobs = [];

    this.logger.log(`Traitement des fichiers: ${files?.length || 0}`);
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          this.logger.log(`Traitement du fichier: ${file.originalname}`);
          const fileExtension = file.originalname.split('.').pop();
          const objectName = `${quiz.userId}/quiz-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
          const fullPath = 'documents/' + objectName;

          this.logger.log(`Téléchargement du fichier vers: ${fullPath}`);
          await this.minioService.uploadFile(file, fullPath);

          // Ajouter le nom du fichier au tableau des médias
          mediaFiles.push(objectName);
          this.logger.log(`Fichier ajouté au tableau mediaFiles: ${objectName}`);

          // RabbitMQ queue for file uploaded event
          jobs.push(
            this.queueProvider({
              bucketName: this.minioService.bucketName,
              objectKey: fullPath,
              fileName: fullPath,
              meta: {
                quizId: createdQuiz.id,
                userId: quiz.userId,
                questionsNumbers: questionsNumbers,
              },
            }, 'file-uploaded'),
          );
        } catch (error) {
          this.logger.error(`Erreur lors du traitement du fichier: ${error}`);
        }
      }
    }

    try {
      await Promise.all(jobs);
      this.logger.log('Tous les jobs RabbitMQ ont été traités');
    } catch (error) {
      this.logger.error(`Erreur lors du traitement des tâches RabbitMQ: ${error}`);
    }

    if (mediaFiles.length > 0) {
      try {
        this.logger.log(`Mise à jour du quiz ${createdQuiz.id} avec ${mediaFiles.length} médias`);

        const updatedQuiz = await this.quizRepository.update(createdQuiz.id, {
          media: mediaFiles
        });

        this.logger.log(`Quiz mis à jour avec succès: ${updatedQuiz.id}, médias: ${updatedQuiz.media?.length || 0}`);
        return updatedQuiz;
      } catch (updateError) {
        this.logger.error(`Erreur lors de la mise à jour des médias du quiz: ${updateError}`);
      }
    } else {
      this.logger.log(`Aucun média à associer au quiz ${createdQuiz.id}`);
    }

    return createdQuiz;
  }

  async update(id: string, quiz: UpdateQuizDto): Promise<Quiz> {
    this.logger.log(`Mise à jour du quiz ${id} avec les données suivantes:`, JSON.stringify(quiz));

    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions = quiz.questions.map(q => ({
        ...q,
        answers: (q.answers || []).map(a => {
          let cValue = a.c;
          if (typeof a.c === 'boolean') cValue = a.c;
          return {
            ...a,
            c: typeof cValue === 'boolean' ? cValue : false
          };
        })
      }));
      this.logger.log(`Quiz ${id} mis à jour avec ${quiz.questions.length} questions`);
      this.logger.log(`Première question: ${quiz.questions[0].q}`);
      this.logger.log(`Nombre de réponses: ${quiz.questions[0].answers.length}`);
    }

    if (quiz.status) {
      this.logger.log(`Statut du quiz mis à jour: ${quiz.status}`);
    }

    return this.quizRepository.update(id, quiz);
  }

  async updateQuizQuestionsFromQueue(quizId: string, questions: any[]): Promise<void> {
    this.logger.log(`Mise à jour du quiz ${quizId} avec les questions depuis la queue quiz-generated`);
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      this.logger.error(`Quiz non trouvé pour l'id: ${quizId}`);
      return;
    }
    // Normalisation du champ c pour chaque réponse, accepte aussi 'correct' (Mongo schema)
    const normalizedQuestions = (questions || []).map(q => ({
      ...q,
      answers: (q.answers || []).map(a => {
        let cValue = a.c;
        if (typeof a.c === 'boolean') cValue = a.c;
        return {
          ...a,
          c: typeof cValue === 'boolean' ? cValue : false
        };
      })
    }));
    quiz.questions = normalizedQuestions;
    quiz.status = 'completed';
    quiz.updatedAt = new Date();
    await this.quizRepository.update(quizId, quiz);
    this.logger.log(`Quiz ${quizId} mis à jour avec ${questions.length} questions.`);
  }

  async delete(id: string): Promise<boolean> {
    return this.quizRepository.delete(id);
  }
}
