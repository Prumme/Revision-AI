import { FileContent } from "../value-objects/FileContent";
import { Quiz } from "../value-objects/Quiz";
import { QuizGenerationError } from "../exceptions/QuizGenerationError";
import { QuizSafetyCheckResult } from "../value-objects/QuizSafetyCheckResult";

export interface IQuizIAAgent{
  /**
   * @param fileContent - The content of the file to be parsed.
   * @param questionsNumbers - The number of questions to be generated in the quiz.
   * @returns A promise that resolves to a Quiz containing the content quiz
   */
  generateQuiz(fileContent: FileContent, questionsNumbers: number): Promise<Quiz | QuizGenerationError>;
  safetyContentCheck(quiz: Quiz) : Promise<QuizGenerationError | QuizSafetyCheckResult>;
  getMaxTry(): number;
  updateQuiz(quiz: Quiz, fileContent: FileContent) : Promise<Quiz | QuizGenerationError>
}