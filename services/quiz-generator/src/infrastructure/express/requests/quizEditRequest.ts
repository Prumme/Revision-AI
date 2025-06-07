import { z } from "zod";
import { QuizSchema } from "../../schemas/QuizSchema";
import { FileContentSchema } from "../../schemas/FileContentSchema";

export const quizEditRequest = z.object({
  userPrompt : z.string(),
  quiz: QuizSchema,
  fileContent: FileContentSchema
})