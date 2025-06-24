import { z } from "zod";
import { FileContentSchema } from "../../schemas/FileContentSchema";

export const fileParsedEvent = z.object({
  fileContent: FileContentSchema,
  meta: z.object({
    quizId: z.string(),
    questionsNumbers: z.number(),
  })
})