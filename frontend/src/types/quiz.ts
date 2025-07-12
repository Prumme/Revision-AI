export interface QuizQuestion {
  question: string;
  answers: Array<{
    a: string;
    c: boolean;
  }>;
}

export interface Quiz {
  id?: string;
  userId?: string;
  username?: string;
  title: string;
  category?: string;
  questions?: QuizQuestion[];
  questionsNumbers?: number;
  description?: string;
  isPublic?: boolean;
  media?: string[];
  status?: "pending" | "processing" | "completed" | "failed" | "published" | "draft";
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
