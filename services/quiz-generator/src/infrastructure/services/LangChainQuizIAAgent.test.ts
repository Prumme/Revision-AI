import { LangChainQuizIAAgent } from "./LangChainQuizIAAgent"; // adapte le chemin
import {
  QuizGenerationError,
  SafetyCheckError,
} from "../../app/exceptions/QuizGenerationError";
import { FileContent } from "../../app/value-objects/FileContent";
import { Quiz } from "../../app/value-objects/Quiz";
import { QuizSchema } from "../schemas/QuizSchema";
import { QuizSafetyCheckResultSchema } from "../schemas/QuizSafetyCheckResultSchema";

// Mocks
const mockInvoke = jest.fn();
const mockStructuredLLM = {
  invoke: mockInvoke,
};
const mockModel = {
  withStructuredOutput: jest.fn(() => mockStructuredLLM),
};
const mockQuizGeneratePrompt = {
  pipe: jest.fn(() => mockStructuredLLM),
};
const mockQuizEvaluatePrompt = {
  pipe: jest.fn(() => mockStructuredLLM),
};

describe("LangChainQuizIAAgent", () => {
  let agent: LangChainQuizIAAgent;

  beforeEach(() => {
    agent = new LangChainQuizIAAgent(
      mockModel as any,
      mockQuizGeneratePrompt as any,
      mockQuizEvaluatePrompt as any
    );
    jest.clearAllMocks();
  });

  it("should generate a quiz from file content", async () => {
    const fileContent: FileContent = {
      fileName: "test.json",
      content: "Test content",
    };

    const mockQuiz = {
      t: "Mock Quiz",
      questions: [
        {
          q: "Q?",
          answers: [{ a: "A", c: true }],
        },
      ],
    };

    mockInvoke.mockResolvedValue(mockQuiz);

    const result = await agent.generateQuiz([fileContent], 1);
    console.log("RESULT_IIC", result);
    expect(result).toEqual(QuizSchema.parse(mockQuiz));
    expect(mockModel.withStructuredOutput).toHaveBeenCalled();
    expect(mockQuizGeneratePrompt.pipe).toHaveBeenCalled();
    expect(mockInvoke).toHaveBeenCalled();
  });

  it("should return an error if quiz parsing fails", async () => {
    mockInvoke.mockResolvedValue({}); // invalid structure

    const fileContent: FileContent = {
      fileName: "invalid.json",
      content: "Broken content",
    };

    const result = await agent.generateQuiz([fileContent], 1);

    expect(result).toBeInstanceOf(QuizGenerationError);
  });

  it("should return a QuizGenerationError when input is too long", async () => {
    const longContent = "A".repeat(999999); // + long que maxInputTokens
    const fileContent: FileContent = {
      fileName: "huge.json",
      content: longContent,
    };

    const result = await agent.generateQuiz([fileContent], 1);
    expect(result).toBeInstanceOf(QuizGenerationError);
  });

  it("should return safety check result", async () => {
    const mockResult = {
      isOffensive: false,
      educationalScore: 90,
    };

    mockInvoke.mockResolvedValue(mockResult);

    const quiz: Quiz = {
      t: "Test Quiz",
      questions: [
        {
          q: "Q?",
          answers: [{ a: "A", c: true }],
        },
      ],
    };

    const result = await agent.safetyContentCheck(quiz);

    expect(result).toEqual(QuizSafetyCheckResultSchema.parse(mockResult));
    expect(mockQuizEvaluatePrompt.pipe).toHaveBeenCalled();
    expect(mockInvoke).toHaveBeenCalled();
  });

  it("should return a SafetyCheckError if result is unparseable", async () => {
    mockInvoke.mockResolvedValue({ invalid: "data" });

    const quiz: Quiz = {
      t: "Test Quiz",
      questions: [
        {
          q: "Q?",
          answers: [{ a: "A", c: true }],
        },
      ],
    };

    const result = await agent.safetyContentCheck(quiz);

    expect(result).toBeInstanceOf(SafetyCheckError);
  });
});
