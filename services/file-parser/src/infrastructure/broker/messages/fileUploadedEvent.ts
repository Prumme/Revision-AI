import { z } from "zod";

export const fileUploadedEvent = z.object({
  bucketName: z.string(),
  objectKey: z.string(),
  fileName: z.string(),
  checksum: z.string(),
});
