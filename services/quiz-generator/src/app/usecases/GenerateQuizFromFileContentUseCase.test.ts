import { Quiz } from "../value-objects/Quiz";
import { QuizGenerationError, SafetyCheckError } from "../exceptions/QuizGenerationError";
import { Failure, Success } from "../../shared/Result";
import { FileContent } from "../value-objects/FileContent";
import { generateQuizFromFileContentFactory } from "./GenerateQuizFromFileContentUseCase";

describe("generateQuizFromFileContentFactory (unit)", () => {
  const mockQuiz = {
    t: "Sample Quiz",
    questions: [
      {
        q: "Sample question?",
        answers: [
          { a: "Answer 1", c: true },
          { a: "Answer 2", c: false },
        ],
      },
    ],
  };

  const mockFileContent: FileContent = {
    fileName: "test.json",
    content: "Educational content here" ,
  };

  const mockQuestionsNumbers = 5;

  const TRY_LIMIT = 3;

  const getMockIAAgent = ({
                            generateQuizReturn,
                            safetyCheckReturn,
                            maxTry = TRY_LIMIT,
                          }: {
    generateQuizReturn: Quiz | QuizGenerationError;
    safetyCheckReturn: QuizGenerationError | { isOffensive: boolean; educationalScore: number } | null;
    maxTry?: number;
  }) => ({
    getMaxTry: jest.fn(() => maxTry),
    generateQuiz: jest.fn().mockResolvedValue(generateQuizReturn),
    safetyContentCheck: jest.fn().mockResolvedValue(safetyCheckReturn),
    updateQuiz : jest.fn(),
  });

  it("should return a successful result when quiz generation and safety check pass", async () => {
    const agent = getMockIAAgent({
      generateQuizReturn: mockQuiz,
      safetyCheckReturn: { isOffensive: false, educationalScore: 75 },
    });

    const useCase = generateQuizFromFileContentFactory(agent);
    const result = await useCase({ fileContent: mockFileContent, questionsNumbers: mockQuestionsNumbers }) as Success<typeof mockQuiz>;

    expect(result.success).toBe(true);
    expect(result.value).toEqual(mockQuiz);
    expect(agent.generateQuiz).toHaveBeenCalledTimes(1);
    expect(agent.safetyContentCheck).toHaveBeenCalledTimes(1);
  });

  it("should retry and return failure after max attempts due to generation errors", async () => {
    const error = new QuizGenerationError("fail");
    const agent = getMockIAAgent({
      generateQuizReturn: error,
      safetyCheckReturn: null,
    });

    const useCase = generateQuizFromFileContentFactory(agent);
    const result = await useCase({ fileContent: mockFileContent, questionsNumbers: mockQuestionsNumbers}) as Failure;

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(QuizGenerationError);
    expect(agent.generateQuiz).toHaveBeenCalledTimes(TRY_LIMIT);
    expect(agent.safetyContentCheck).not.toHaveBeenCalled();
  });

  it("should retry and return failure after safety check fails multiple times", async () => {
    const agent = getMockIAAgent({
      generateQuizReturn: mockQuiz,
      safetyCheckReturn: new QuizGenerationError("safety fail"),
    });

    const useCase = generateQuizFromFileContentFactory(agent);
    const result = await useCase({ fileContent: mockFileContent, questionsNumbers: mockQuestionsNumbers }) as Failure;

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(QuizGenerationError);
    expect(agent.generateQuiz).toHaveBeenCalledTimes(TRY_LIMIT);
    expect(agent.safetyContentCheck).toHaveBeenCalledTimes(TRY_LIMIT);
  });

  it("should reject offensive or low-score quizzes", async () => {
    const agent = getMockIAAgent({
      generateQuizReturn: mockQuiz,
      safetyCheckReturn: { isOffensive: true, educationalScore: 20 },

    });

    const useCase = generateQuizFromFileContentFactory(agent);
    const result = await useCase({ fileContent: mockFileContent, questionsNumbers: mockQuestionsNumbers }) as Failure;

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(SafetyCheckError);
  });
});
