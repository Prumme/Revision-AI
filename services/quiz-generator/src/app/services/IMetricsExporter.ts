import { QuizGenerationError } from "../exceptions/QuizGenerationError";

export interface IMetricsExporter {
  incQuizGenerationAttempts(): void
  reportQuizGenerationTime(time: number): void
  reportSafetyCheckTime(time: number): void
  reportQuizGenerationRetries(retries: number): void
  reportQuizGenerationError(error: QuizGenerationError): void
}