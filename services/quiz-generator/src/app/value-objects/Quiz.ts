export interface Quiz {
  t: string
  questions: Question[]
}

export interface Question {
  q: string
  answers: Answer[]
}

export interface Answer {
  a: string
  c: boolean
}