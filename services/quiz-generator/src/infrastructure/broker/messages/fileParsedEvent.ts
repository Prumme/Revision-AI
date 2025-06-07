import { z } from "zod";
import { FileContentSchema } from "../../schemas/FileContentSchema";

export const fileParsedEvent = z.object({
  fileContent : FileContentSchema
})