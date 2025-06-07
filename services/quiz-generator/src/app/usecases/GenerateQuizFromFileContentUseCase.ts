import { IUseCase } from "../../shared/IUseCase";
import { IQuizIAAgent } from "../services/IQuizIAAgent";
import { FileContent } from "../value-objects/FileContent";
import { Result } from "../../shared/Result";
import { MaxGenerationAttemptsError, QuizGenerationError, SafetyCheckError } from "../exceptions/QuizGenerationError";
import { Quiz } from "../value-objects/Quiz";
import { IMetricsExporter } from "../services/IMetricsExporter";
import { Timer, TimeUnit } from "../../shared/Timer";

export type GenerateQuizFromFileContentInput = {
  fileContent: FileContent;
}

export type GenerateQuizFromFileContentUseCase = IUseCase<GenerateQuizFromFileContentInput,Result<Quiz>>
export const generateQuizFromFileContentFactory = (quizIAAgent : IQuizIAAgent, metricExporter ?: IMetricsExporter) : GenerateQuizFromFileContentUseCase => {
  return async (input : GenerateQuizFromFileContentInput) => {
    let tryLeft = quizIAAgent.getMaxTry();
    let lastError : QuizGenerationError | null = null;
    do{
      console.log(`Trying to generate quiz from file content. Attempts left: ${tryLeft}`);
      metricExporter?.incQuizGenerationAttempts();
      const {result: quiz, duration: generationDuration} = await Timer.measure(() => quizIAAgent.generateQuiz(input.fileContent), TimeUnit.SECOND);
      metricExporter?.reportQuizGenerationTime(generationDuration);
      if(quiz instanceof QuizGenerationError) {
        lastError = quiz;
        metricExporter?.reportQuizGenerationError(lastError);
        tryLeft--;
        continue;
      }

      const {result: safetyCheck, duration: checkDuration} = await Timer.measure(() => quizIAAgent.safetyContentCheck(quiz), TimeUnit.SECOND)
      metricExporter?.reportSafetyCheckTime(checkDuration);

      if(safetyCheck instanceof Error) {
        lastError = safetyCheck;
        metricExporter?.reportQuizGenerationError(lastError);
        tryLeft--;
        continue;
      }

      if(safetyCheck.isOffensive || safetyCheck.educationalScore < 50) {
        lastError = new SafetyCheckError("Quiz content is not safe");
        metricExporter?.reportQuizGenerationError(lastError);
        tryLeft--;
        continue;
      }
      metricExporter?.reportQuizGenerationRetries(quizIAAgent.getMaxTry() - tryLeft);
      return Result.Success(quiz);
    }while (tryLeft > 0);

    metricExporter?.reportQuizGenerationRetries(quizIAAgent.getMaxTry() - tryLeft);
    if(!lastError) {
      lastError = new MaxGenerationAttemptsError();
      metricExporter?.reportQuizGenerationError(lastError);
    }
    return Result.Failure(lastError);
  }
}