import { IQuizIAAgent } from "../../app/services/IQuizIAAgent";
import { Quiz } from "../../app/value-objects/Quiz";
import {
  QuizGenerationError,
  SafetyCheckError,
} from "../../app/exceptions/QuizGenerationError";
import { QuizSafetyCheckResult } from "../../app/value-objects/QuizSafetyCheckResult";
import { FileContent } from "../../app/value-objects/FileContent";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { QuizSchema } from "../schemas/QuizSchema";
import { QuizSafetyCheckResultSchema } from "../schemas/QuizSafetyCheckResultSchema";
import { PromptTemplate } from "@langchain/core/prompts";

const maxOutputTokens = Number(process.env.SCALEWAY_MAX_TOKEN) || 1000;
const maxInputTokens = Number(process.env.SCALEWAY_MAX_TOKEN_INPUT) || 30000;

const model = new ChatGoogleGenerativeAI({
  model: process.env.GOODLE_MODEL || "gemini-2.0-flash",
  temperature: 0.2,
  maxOutputTokens,
});

const quizStructuredllm = model.withStructuredOutput(QuizSchema);
const quizSafetyCheckStructuredllm = model.withStructuredOutput(
  QuizSafetyCheckResultSchema,
);

const quizGeneratePrompt = PromptTemplate.fromTemplate(`
Generate a quiz from the \"contents\" key of a JSON files, you receive an array of multiple file content.  
Detect the language of the content and write the quiz in that language.
Generate exactly {questionsCount} questions.
Return **only** this JSON format (no text, no markdown):
{ "t": "Quiz title", 
  "questions": [{ "q": "Question?", "answers": [{ "a": "Answer 1", "c": true }, { "a": "Answer 2", "c": false }]}]
}
Each question must have 2–5 answers, at least one and max 2 marked "c": true,  Cover key ideas from the content.

The content : 
{content}
`);

const quizEvaluatePrompt = PromptTemplate.fromTemplate(`
You are a content safety evaluator for educational quizzes.
Analyze the provided quiz and determine if any part of the content is offensive, insulting, inappropriate, or culturally insensitive.
You also need to evaluate the educational value of the quiz with a score from 0 to 100.
The score should reflect the quiz's ability to educate and inform the audience.
If quiz is offensive and has a low educational score, it will be rejected. 
Return **only** this JSON format in this strict format (no text, no markdown):
{
  "isOffensive": true,
  "educationalScore": 0
}

Quiz to evaluate
{quiz}
`);

export class LangChainQuizIAAgent implements IQuizIAAgent {
  async generateQuiz(
    filesContents: FileContent[],
    questionsNumbers: number,
  ): Promise<Quiz | QuizGenerationError> {
    const json = JSON.stringify(filesContents);
    if (json.length > maxInputTokens)
      return new QuizGenerationError("Files contents is too long");
    try {
      const data = await quizGeneratePrompt.pipe(quizStructuredllm).invoke({
        questionsCount: questionsNumbers,
        content: filesContents,
      });

      try {
        return QuizSchema.parse(data);
      } catch (error) {
        console.error("[QUIZ] Error parsing result json AI Output:", error);
        console.error(data);
        return new QuizGenerationError("Failed to parse AI response");
      }
    } catch (e) {
      console.error("[Quiz] error generating result");
      return new QuizGenerationError("Failed to generate AI response");
    }
  }

  getMaxTry(): number {
    return 1;
  }

  async safetyContentCheck(
    quiz: Quiz,
  ): Promise<QuizGenerationError | QuizSafetyCheckResult> {
    try {
      const data = await quizEvaluatePrompt
        .pipe(quizSafetyCheckStructuredllm)
        .invoke({
          quiz,
        });
      try {
        return QuizSafetyCheckResultSchema.parse(data);
      } catch (error) {
        console.error(
          "[SAFETYCHECK] Error parsing result json IA Output:",
          error,
        );
        console.error(data);
        return new SafetyCheckError("Failed to parse AI response");
      }
    } catch (e) {
      console.error("[SAFETYCHECK] Error while generating result");
      return new SafetyCheckError("Error while generating result");
    }
  }

  updateQuiz(
    quiz: Quiz,
    fileContent: FileContent,
  ): Promise<Quiz | QuizGenerationError> {
    throw new Error("Method not implemented.");
  }
}
