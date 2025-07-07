import { createQuizGenerationJob, markFileAsParsed, isReadyForGeneration, addEventJob, completeJob, failJob, processJob, QuizGenerationJobStatus } from './quiz-generation-job.entity';

describe('QuizGenerationJob Entity', () => {
  describe('createQuizGenerationJob', () => {
    it('should create a job with the correct properties', () => {
      const userId = 'user123';
      const quizId = 'quiz123';
      const files = ['file1', 'file2'];

      const job = createQuizGenerationJob(userId, quizId, files);

      expect(job.userId).toBe(userId);
      expect(job.quizId).toBe(quizId);
      expect(job.status).toBe(QuizGenerationJobStatus.PENDING);
      expect(job.files).toEqual([
        { identifier: 'file1', parsed: false },
        { identifier: 'file2', parsed: false },
      ]);
      expect(job.events).toEqual([]);
      expect(job.createdAt).toBeInstanceOf(Date);
      expect(job.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('markFileAsParsed', () => {
    it('should mark a file as parsed and add an event', () => {
      const userId = 'user123';
      const quizId = 'quiz123';
      const files = ['file1', 'file2'];
      const job = createQuizGenerationJob(userId, quizId, files);

      const updatedJob = markFileAsParsed(job, 'file1');

      expect(updatedJob.files).toEqual([
        { identifier: 'file1', parsed: true },
        { identifier: 'file2', parsed: false },
      ]);
      expect(updatedJob.events.length).toBe(1);
      expect(updatedJob.events[0].message).toBe('File file1 parsed successfully');
      expect(updatedJob.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('isReadyForGeneration', () => {
    it('should return true if all files are parsed', () => {
      const userId = 'user123';
      const quizId = 'quiz123';
      const files = ['file1', 'file2'];
      const job = createQuizGenerationJob(userId, quizId, files);

      const updatedJob = markFileAsParsed(job, 'file1');
      const finalJob = markFileAsParsed(updatedJob, 'file2');

      expect(isReadyForGeneration(finalJob)).toBe(true);
    });

    it('should return false if not all files are parsed', () => {
      const userId = 'user123';
      const quizId = 'quiz123';
      const files = ['file1', 'file2'];
      const job = createQuizGenerationJob(userId, quizId, files);

      const updatedJob = markFileAsParsed(job, 'file1');

      expect(isReadyForGeneration(updatedJob)).toBe(false);
    });
  });

  describe('addEventJob', () => {
    it('should add an event to the job', () => {
      const userId = 'user123';
      const quizId = 'quiz123';
      const files = ['file1', 'file2'];
      const job = createQuizGenerationJob(userId, quizId, files);

      const updatedJob = addEventJob(job, {
        error: false,
        message: 'Test event',
      });

      expect(updatedJob.events.length).toBe(1);
      expect(updatedJob.events[0].message).toBe('Test event');
      expect(updatedJob.events[0].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('completeJob', () => {
    it('should mark the job as completed and add an event', () => {
      const userId = 'user123';
      const quizId = 'quiz123';
      const files = ['file1', 'file2'];
      const job = createQuizGenerationJob(userId, quizId, files);

      const completedJob = completeJob(job);

      expect(completedJob.status).toBe(QuizGenerationJobStatus.COMPLETED);
      expect(completedJob.events.length).toBe(1);
      expect(completedJob.events[0].message).toBe('Quiz generation completed successfully');
      expect(completedJob.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('failJob', () => {
    it('should mark the job as failed and add an event', () => {
      const userId = 'user123';
      const quizId = 'quiz123';
      const files = ['file1', 'file2'];
      const job = createQuizGenerationJob(userId, quizId, files);

      const failedJob = failJob(job, 'Error occurred');

      expect(failedJob.status).toBe(QuizGenerationJobStatus.FAILED);
      expect(failedJob.events.length).toBe(1);
      expect(failedJob.events[0].message).toBe('Error occurred');
      expect(failedJob.events[0].error).toBe(true);
      expect(failedJob.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('processJob', () => {
    it('should mark the job as processing', () => {
      const userId = 'user123';
      const quizId = 'quiz123';
      const files = ['file1', 'file2'];
      const job = createQuizGenerationJob(userId, quizId, files);

      const processingJob = processJob(job);

      expect(processingJob.status).toBe(QuizGenerationJobStatus.PROCESSING);
      expect(processingJob.updatedAt).toBeInstanceOf(Date);
    });
  });
});
