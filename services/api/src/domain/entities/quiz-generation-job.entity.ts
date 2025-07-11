import { ApiProperty } from '@nestjs/swagger';
import * as crypto from 'node:crypto';

export enum QuizGenerationJobStatus {
  PENDING = 'pending',
  PARSING_FILES = "parsing_files",
  GENERATING = "generating",
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface QuizGenerationJobEvent {
  error: boolean;
  message: string;
  timestamp: Date;
}

export interface QuizGenerationFile {
  identifier: string;
  parsed: boolean;
}

export interface QuizGenerationJob {
  id: string;
  userId: string;
  quizId: string;
  status: QuizGenerationJobStatus;
  events: QuizGenerationJobEvent[];
  files: QuizGenerationFile[];
  createdAt: Date;
  updatedAt: Date;
}

export function createQuizGenerationJob(
  userId: string,
  quizId,
  files: string[] = [],
): QuizGenerationJob {
  const id = crypto.randomUUID();
  return {
    id,
    quizId,
    userId,
    status: QuizGenerationJobStatus.PENDING,
    events: [],
    files: files.map((file) => ({
      identifier: file,
      parsed: false,
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function markFileAsParsed(
  job: QuizGenerationJob,
  fileIdentifier: string,
): QuizGenerationJob {
  const files = job.files.map((file) =>
    file.identifier === fileIdentifier ? { ...file, parsed: true } : file,
  );
  job = addEventJob(job, {
    error: false,
    message: `File ${fileIdentifier} parsed successfully`,
  });
  return {
    ...job,
    files,
    updatedAt: new Date(),
  };
}

export function isReadyForGeneration(job: QuizGenerationJob): boolean {
  return job.files.every((file) => file.parsed);
}

export function addEventJob(
  job: QuizGenerationJob,
  event: Omit<QuizGenerationJobEvent, 'timestamp'>,
): QuizGenerationJob {
  return {
    ...job,
    events: [
      ...job.events,
      {
        ...event,
        timestamp: new Date(),
      },
    ],
    updatedAt: new Date(),
  };
}

export function startParsing(job: QuizGenerationJob): QuizGenerationJob {
  return {
    ...job,
    status: QuizGenerationJobStatus.PARSING_FILES,
    updatedAt : new Date()
  }
}

export function startGenerating(job: QuizGenerationJob): QuizGenerationJob {
  return {
    ...job,
    status: QuizGenerationJobStatus.GENERATING,
    updatedAt : new Date()
  }
}

export function completeJob(job: QuizGenerationJob): QuizGenerationJob {
  job = addEventJob(job, {
    error: false,
    message: 'Quiz generation completed successfully',
  });
  return {
    ...job,
    status: QuizGenerationJobStatus.COMPLETED,
    updatedAt: new Date(),
  };
}

export function failJob(
  job: QuizGenerationJob,
  message: string,
): QuizGenerationJob {
  const event: QuizGenerationJobEvent = {
    error: true,
    message,
    timestamp: new Date(),
  };
  return addEventJob(
    {
      ...job,
      status: QuizGenerationJobStatus.FAILED,
    },
    event,
  );
}

/* export function processJob(job: QuizGenerationJob): QuizGenerationJob {
  return {
    ...job,
    status: QuizGenerationJobStatus.PROCESSING,
    updatedAt: new Date(),
  };
} */
