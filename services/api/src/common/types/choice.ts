export interface Choice {
  id: string;
  label: string;
}

export interface QuestionChoice extends Choice {
  correct: boolean;
}

export interface AnswerChoice extends Choice {
  selected: boolean;
}
