import { z } from "zod";

export const FileContentSchema = z.object({
  fileName: z.string(),
  content: z.string().optional(),
  pages: z.array(
    z.object({
      number: z.number(),
      content: z.string(),
      images: z.array(
        z.object({
          fileName: z.string(),
          content: z.string(),
        })
      ),
    })
  ).optional(),
})