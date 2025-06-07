export class QuizGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizGenerationError";
  }
}

export class MaxGenerationAttemptsError extends QuizGenerationError {
  constructor() {
    super("Max generation attempts reached");
  }
}

export class SafetyCheckError extends QuizGenerationError {
  constructor(message: string) {
    super(message);
    this.name = "SafetyCheckError";
  }
}