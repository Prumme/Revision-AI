import { IQuizIAAgent } from "../../app/services/IQuizIAAgent";
import { FileContent } from "../../app/value-objects/FileContent";
import { QuizGenerationError, SafetyCheckError } from "../../app/exceptions/QuizGenerationError";
import OpenAI from "openai";
import { Quiz } from "../../app/value-objects/Quiz";
import { QuizSafetyCheckResult } from "../../app/value-objects/QuizSafetyCheckResult";
import { QuizSchema } from "../schemas/QuizSchema";
import { QuizSafetyCheckResultSchema } from "../schemas/QuizSafetyCheckResultSchema";

const defaultClient = new OpenAI({
  baseURL: process.env.SCALEWAY_IA_API_URL || "",
  apiKey: process.env.SCALEWAY_ACCESS_KEY || "",
});


const model = process.env.SCALEWAY_MODEL || "deepseek-r1-distill-llama-70b";

const maxTokenOutput = Number(process.env.SCALEWAY_MAX_TOKEN) || 1000;
const maxTokenInput = Number(process.env.SCALEWAY_MAX_TOKEN_INPUT) || 5000;

const quizGeneratePrompt = `
Generate a quiz from the "content" key of a JSON file.  
Detect the language of the content and write the quiz in that language.
Return **only** this JSON format (no text, no markdown):
{ "t": "Quiz title", 
  "questions": [{ "q": "Question?", "answers": [{ "a": "Answer 1", "c": true }, { "a": "Answer 2", "c": false }]}]
}
Each question must have 2–5 answers, at least one and max 2 marked "c": true,  Cover key ideas from the content.
`;

const quizEvaluatePrompt = `
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
`;

export class ScalewayQuizIAAgent implements IQuizIAAgent {
  constructor(
    private AIClient: OpenAI = defaultClient
  ) {}

  getMaxTry(): number {
       return Number(process.env.SCALEWAY_MAX_TRY) || 3;
  }

  private async getStream(systemPrompt : string, prompt : string){
    const stream = await this.AIClient.chat.completions.create({
      model,
      messages: [
        {
          "role": "system",
          "content": systemPrompt
        },
        { "role": "user", "content": `${prompt}` }
      ],
      max_tokens: maxTokenOutput,
      temperature: 0.6,
      top_p: 0.95,
      presence_penalty: 0,
      stream: true,
    })

    let data = "";
    for await (const part of stream) {
      data += part.choices[0].delta.content;
    }

    return data
  }

  private cleanResult(data: string) {
    if(data.endsWith("}") && data.startsWith("{")) {
      return data;
    }
    const start = data.indexOf("{");
    const end = data.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return data;
    }
    return data.substring(start, end + 1);
  }

  async generateQuiz(fileContent: FileContent): Promise<Quiz | QuizGenerationError> {
    const json = JSON.stringify(fileContent);
    if(json.length > maxTokenInput) return new QuizGenerationError("File content is too long");
    const data = await this.getStream(quizGeneratePrompt, json);
    try {
      return QuizSchema.parse(JSON.parse(this.cleanResult(data)));
    } catch (error) {
      console.error("[QUIZ] Error parsing result json IA Output:", error);
      console.error(data)
      return new QuizGenerationError("Failed to parse AI response");
    }
  }

  async safetyContentCheck(quiz: Quiz): Promise<QuizSafetyCheckResult | QuizGenerationError> {
    const json = JSON.stringify(quiz);
    const data = await this.getStream(quizEvaluatePrompt, json);
    try {
      return QuizSafetyCheckResultSchema.parse(JSON.parse(this.cleanResult(data)));
    } catch (error) {
      console.error("[SAFETYCHECK] Error parsing result json IA Output:", error);
      console.error(data)
      return new SafetyCheckError("Failed to parse AI response");
    }
  }

  updateQuiz(quiz: Quiz, fileContent: FileContent): Promise<Quiz | QuizGenerationError> {
    return Promise.resolve(undefined);
  }
}