import { QuizGenerationJobRepository } from '@repositories/quiz-generation-job.repository';
import { QuizGenerationJob } from '@entities/quiz-generation-job.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { QuizGenerationJobDocument } from '@mongo/quiz/quiz-generation-job.schema';

export class MongoQuizGenerationJobRepository
  implements QuizGenerationJobRepository
{
  constructor(
    @InjectModel('QuizGenerationJob')
    private readonly quizGenerationJob: Model<QuizGenerationJobDocument>,
  ) {}

  async findById(jobId: string): Promise<QuizGenerationJob | null> {
    const job = await this.quizGenerationJob.findOne({ id: jobId }).exec();
    if (!job) return null;

    return this.documentToEntity(job);
  }

  async findByQuizId(quizId: string): Promise<QuizGenerationJob | null> {
    const job = await this.quizGenerationJob.findOne({ quizId }).exec();
    if (!job) return null;
    return this.documentToEntity(job);
  }

  async findProcessingJobs(query: {
    files: string[];
  }): Promise<QuizGenerationJob[]> {
    const jobs = await this.quizGenerationJob
      .find({
        'files.identifier': { $in: query.files },
      })
      .exec();

    return jobs.map((job) => this.documentToEntity(job));
  }

  async putJob(
    jobData: Omit<QuizGenerationJob, 'id'>,
    jobId?: string,
  ): Promise<boolean> {
    try {
      if (jobId) {
        // Update existing job
        const result = await this.quizGenerationJob
          .updateOne(
            { id: jobId },
            { $set: { ...jobData, updatedAt: new Date() } },
          )
          .exec();
        return result.modifiedCount > 0;
      } else {
        const newJob = new this.quizGenerationJob({
          ...jobData,
        });
        await newJob.save();
        return true;
      }
    } catch (error) {
      console.error('Error saving quiz generation job:', error);
      return false;
    }
  }

  private documentToEntity(doc: QuizGenerationJobDocument): QuizGenerationJob {
    return {
      id: doc.id,
      userId: doc.userId,
      quizId: doc.quizId,
      status: doc.status,
      events: doc.events.map((event) => ({
        error: event.error,
        message: event.message,
        timestamp: event.timestamp,
      })),
      files: doc.files.map((file) => ({
        identifier: file.identifier,
        parsed: file.parsed,
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
