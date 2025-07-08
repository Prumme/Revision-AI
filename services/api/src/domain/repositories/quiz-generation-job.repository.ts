import { QuizGenerationJob } from '@entities/quiz-generation-job.entity';
import { MongoQuizGenerationJobRepository } from '@mongo/quiz/quiz-generation-job.repository';

export interface QuizGenerationJobRepository {
  findById(jobId: string): Promise<QuizGenerationJob | null>;
  findByQuizId(quizId: string): Promise<QuizGenerationJob | null>;
  putJob(
    jobData: Omit<QuizGenerationJob, 'id'>,
    jobId?: string,
  ): Promise<boolean>;

  findProcessingJobs(query: { files: string[] }): Promise<QuizGenerationJob[]>;
}

export const QuizGenerationJobRepositoryProvider = {
  provide: 'QuizGenerationJobRepository',
  useClass: MongoQuizGenerationJobRepository,
};
