export interface QuizGeneratedSuccessDTO {
  success: true;
  identifier: string;
  t: string;
  questions: {
    q: string;
    answers: {
      a: string;
      c: boolean;
    }[];
  }[];
}

export interface QuizGeneratedErrorDTO {
  success: false;
  identifier: string;
  error: string;
}

export type QuizGeneratedDTO = QuizGeneratedSuccessDTO | QuizGeneratedErrorDTO;
