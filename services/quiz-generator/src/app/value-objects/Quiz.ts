export interface Quiz {
  t: string;
  questions: Question[];
}

export interface Question {
  q: string;
  answers: Answer[];
}

export interface Answer {
  a: string;
  c: boolean;
}

export function suffleQuizChoice(quiz: Quiz): Quiz {
  const suffledQuiz: Quiz = {
    t: quiz.t,
    questions: quiz.questions.map((question) => {
      const suffledAnswers = question.answers
        .map((answer) => ({ ...answer }))
        .sort(() => Math.random() - 0.5);
      return {
        q: question.q,
        answers: suffledAnswers,
      };
    }),
  };
  return suffledQuiz;
}
