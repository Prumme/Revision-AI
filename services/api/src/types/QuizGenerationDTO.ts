import { FileContentDTO } from "./FileContentDTO";

export type QuizGenerationDTO = {
  identifier: string;
  filesContents: FileContentDTO[];
  questionsNumbers: number;
};
