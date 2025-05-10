import { z } from "zod";

export const QuizSafetyCheckResultSchema = z.object({
  isOffensive: z.boolean(),
  educationalScore: z.number(),
})