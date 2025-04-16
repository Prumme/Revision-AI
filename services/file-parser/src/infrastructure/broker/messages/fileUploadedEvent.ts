import { z } from "zod";

export const fileUploadedEvent = z.object({
  fileId: z.string(),
  fileUrl: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  userId: z.string(),
  uploadDate: z.date(),
})