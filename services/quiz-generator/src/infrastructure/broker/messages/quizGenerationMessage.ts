import { z } from "zod";
import { FileContentSchema } from "../../schemas/FileContentSchema";

export const quizGenerationMessage = z.object({
  identifier: z.string().min(1),
  questionsNumbers: z.number(),
  filesContents: z.array(FileContentSchema),
});
