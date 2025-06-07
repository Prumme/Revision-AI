import { z } from "zod";

export const QuizSchema = z.object({
  t: z.string(),
  questions: z.array(z.object({
    q: z.string(),
    answers: z.array(z.object({
      a: z.string(),
      c: z.boolean(),
    })),
  })),
});
