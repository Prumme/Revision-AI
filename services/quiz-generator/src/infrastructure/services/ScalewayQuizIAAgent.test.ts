import { ScalewayQuizIAAgent } from "./ScalewayQuizIAAgent"; // adapte le chemin
import { FileContent } from "../../app/value-objects/FileContent";
import { Quiz } from "../../app/value-objects/Quiz";

const mockStream = async function* () {
  yield {
    choices: [
      {
        delta: {
          content:
            '{ "t": "Mock Quiz", "questions": [ { "q": "Q?", "answers": [ { "a": "A", "c": true } ] } ] }',
        },
      },
    ],
  };
};

const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue(mockStream()),
    },
  },
};

describe("ScalewayQuizIAAgent", () => {
  let agent: ScalewayQuizIAAgent;

  beforeEach(() => {
    agent = new ScalewayQuizIAAgent(mockOpenAI as never);
  });

  it("should generate a quiz from file content", async () => {
    const fileContent: FileContent = {
      fileName: "test.json",
      content: "Test content",
    };

    const result = await agent.generateQuiz(fileContent, 1);

    const result = await agent.generateQuiz(fileContent, questionsNumbers);

    expect(result).toEqual({
      t: "Mock Quiz",
      questions: [
        {
          q: "Q?",
          answers: [{ a: "A", c: true }],
        },
      ],
    });
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
  });

  const safetyMockStream = async function* () {
    yield {
      choices: [
        {
          delta: {
            content: '{ "isOffensive": false, "educationalScore": 85 }',
          },
        },
      ],
    };
  };

  const mockOpenAIWithSafety = {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue(safetyMockStream()),
      },
    },
  };

  it("should return safety check result", async () => {
    agent = new ScalewayQuizIAAgent(mockOpenAIWithSafety as any);

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

    expect(result).toEqual({
      isOffensive: false,
      educationalScore: 85,
    });
  });
});
