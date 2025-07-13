import { SessionService } from './session.service'; // Adjust path as needed
import { v4 as uuidv4 } from 'uuid';
import { SessionStatus } from '@entities/session.entity';
import { NotFoundException } from '@nestjs/common';
import { SessionNotFoundException } from '@modules/session/exceptions/session-not-found.exception';
import { EndSessionDto } from '@modules/session/dto/end-session.dto';
import { SessionAlreadyFinishedException } from '@modules/session/exceptions/session-already-finished.exception';
import { SessionAccessDenied } from '@modules/session/exceptions/session-access-denied'; // Assuming uuid is used for ID generation

// Mock the uuidv4 function to ensure consistent IDs in tests
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

// Mock the entire SessionRepository
const mockSessionRepository = {
  findById: jest.fn(),
  findAllByUserId: jest.fn(),
  findAllByQuizId: jest.fn(),
  findAllByQuizIdAndUserId: jest.fn(),
  create: jest.fn(),
  patch: jest.fn(),
};

// Mock the entire UserRepository
const mockUserRepository = {
  findById: jest.fn(),
};

// Mock the entire QuizRepository
const mockQuizRepository = {
  findById: jest.fn(),
};

describe('SessionService', () => {
  let service: SessionService;
  let sessionRepository: jest.Mocked<typeof mockSessionRepository>;
  let userRepository: jest.Mocked<typeof mockUserRepository>;
  let quizRepository: jest.Mocked<typeof mockQuizRepository>;

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Initialize the service with mocked dependencies
    service = new SessionService(
      mockSessionRepository as any,
      mockUserRepository as any,
      mockQuizRepository as any,
    );

    // Assign mocked repositories for easier access in tests
    sessionRepository = mockSessionRepository as jest.Mocked<
      typeof mockSessionRepository
    >;
    userRepository = mockUserRepository as jest.Mocked<
      typeof mockUserRepository
    >;
    quizRepository = mockQuizRepository as jest.Mocked<
      typeof mockQuizRepository
    >;

    // Mock uuidv4 to return a predictable ID
    (uuidv4 as jest.Mock).mockReturnValue('mock-session-id');
  });

  // --- Test cases for findById method ---
  describe('findById', () => {
    it('should return a session if found', async () => {
      const mockSession = { id: '1', userId: 'user1', quizId: 'quiz1' };
      sessionRepository.findById.mockResolvedValue(mockSession as any);

      const result = await service.findById('1');
      expect(result).toEqual(mockSession);
      expect(sessionRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw SessionNotFoundException if session not found', async () => {
      sessionRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        SessionNotFoundException,
      );
      expect(sessionRepository.findById).toHaveBeenCalledWith(
        'non-existent-id',
      );
    });
  });

  // --- Test cases for findAllByUserId method ---
  describe('findAllByUserId', () => {
    it('should call sessionRepository.findAllByUserId with correct parameters', async () => {
      const mockSessions = [{ id: 's1' }, { id: 's2' }];
      const userId = 'user1';
      const filters = { scoreMin: 50, status: 'FINISHED' };
      const pagination = { page: 1, limit: 10 };

      sessionRepository.findAllByUserId.mockResolvedValue(mockSessions as any);

      const result = await service.findAllByUserId(userId, filters, pagination);

      expect(result).toEqual(mockSessions);
      expect(sessionRepository.findAllByUserId).toHaveBeenCalledWith(userId, {
        ...pagination,
        ...filters,
      });
    });
  });

  // --- Test cases for findAllByQuizId method ---
  describe('findAllByQuizId', () => {
    it('should call sessionRepository.findAllByQuizId with correct parameters', async () => {
      const mockSessions = [{ id: 's3' }, { id: 's4' }];
      const quizId = 'quiz1';
      const excludeUserId = 'userX';

      sessionRepository.findAllByQuizId.mockResolvedValue(mockSessions as any);

      const result = await service.findAllByQuizId(quizId, excludeUserId);

      expect(result).toEqual(mockSessions);
      expect(sessionRepository.findAllByQuizId).toHaveBeenCalledWith(
        quizId,
        excludeUserId,
      );
    });

    it('should call sessionRepository.findAllByQuizId without excludeUserId if not provided', async () => {
      const mockSessions = [{ id: 's3' }, { id: 's4' }];
      const quizId = 'quiz1';

      sessionRepository.findAllByQuizId.mockResolvedValue(mockSessions as any);

      const result = await service.findAllByQuizId(quizId);

      expect(result).toEqual(mockSessions);
      expect(sessionRepository.findAllByQuizId).toHaveBeenCalledWith(
        quizId,
        undefined,
      );
    });
  });

  // --- Test cases for findAllByQuizIdAndUserId method ---
  describe('findAllByQuizIdAndUserId', () => {
    it('should call sessionRepository.findAllByQuizIdAndUserId with correct parameters', async () => {
      const mockSessions = [{ id: 's5' }];
      const quizId = 'quiz1';
      const userId = 'user1';
      const options = { page: 1, limit: 5, scoreMin: 70 }; // Note: options are not passed to repository in original code

      sessionRepository.findAllByQuizIdAndUserId.mockResolvedValue(
        mockSessions as any,
      );

      const result = await service.findAllByQuizIdAndUserId(
        quizId,
        userId,
        options,
      );

      expect(result).toEqual(mockSessions);
      // The original code does not pass options to the repository, so we test for that behavior
      expect(sessionRepository.findAllByQuizIdAndUserId).toHaveBeenCalledWith(
        quizId,
        userId,
      );
    });
  });

  // --- Test cases for createSession method ---
  describe('createSession', () => {
    const createSessionDto = {
      userId: 'user1',
      quizId: 'quiz1',
    };
    const mockUser = { id: 'user1', name: 'Test User' };
    const mockQuiz = { id: 'quiz1', title: 'Test Quiz' };

    it('should create and return a new session if user and quiz exist', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);
      quizRepository.findById.mockResolvedValue(mockQuiz as any);
      sessionRepository.create.mockImplementation((data) =>
        Promise.resolve({ ...data, id: 'mock-session-id' } as any),
      );

      const result = await service.createSession(createSessionDto);

      expect(userRepository.findById).toHaveBeenCalledWith(
        createSessionDto.userId,
      );
      expect(quizRepository.findById).toHaveBeenCalledWith(
        createSessionDto.quizId,
      );
      expect(sessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-session-id',
          quizId: mockQuiz.id,
          userId: mockUser.id,
          startedAt: expect.any(Date),
          finishedAt: null,
          answers: [],
          score: 0,
          status: SessionStatus.ACTIVE,
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: 'mock-session-id',
          quizId: mockQuiz.id,
          userId: mockUser.id,
          status: SessionStatus.ACTIVE,
        }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);
      quizRepository.findById.mockResolvedValue(mockQuiz as any);

      await expect(service.createSession(createSessionDto)).rejects.toThrow(
        new NotFoundException(
          `User with id ${createSessionDto.userId} not found`,
        ),
      );
      expect(userRepository.findById).toHaveBeenCalledWith(
        createSessionDto.userId,
      );
      expect(quizRepository.findById).not.toHaveBeenCalled(); // Quiz check should not happen if user is not found
      expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if quiz not found', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);
      quizRepository.findById.mockResolvedValue(null);

      await expect(service.createSession(createSessionDto)).rejects.toThrow(
        new NotFoundException(
          `Quiz with id ${createSessionDto.quizId} not found`,
        ),
      );
      expect(userRepository.findById).toHaveBeenCalledWith(
        createSessionDto.userId,
      );
      expect(quizRepository.findById).toHaveBeenCalledWith(
        createSessionDto.quizId,
      );
      expect(sessionRepository.create).not.toHaveBeenCalled();
    });
  });

  // --- Test cases for startSession method ---
  describe('startSession', () => {
    it('should return the started session if found', async () => {
      const mockSession = {
        id: '1',
        status: SessionStatus.PAUSED,
        startedAt: null,
      };
      const startedSession = {
        ...mockSession,
        status: SessionStatus.ACTIVE,
        startedAt: new Date(),
      };
      sessionRepository.findById.mockResolvedValue(startedSession as any);

      const result = await service.startSession('1');
      expect(result).toEqual(startedSession);
      expect(sessionRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw SessionNotFoundException if session not found', async () => {
      sessionRepository.findById.mockResolvedValue(null);

      await expect(service.startSession('non-existent-id')).rejects.toThrow(
        SessionNotFoundException,
      );
      expect(sessionRepository.findById).toHaveBeenCalledWith(
        'non-existent-id',
      );
    });
  });

  // --- Test cases for endSession method ---
  describe('endSession', () => {
    const sessionId = 's1';
    const userId = 'user1';
    const endSessionDto: EndSessionDto = {
      sessionId,

      score: 80,
      answers: [{ a: 'ans1', correct: true }],
    };
    const mockSession = {
      id: sessionId,
      userId: userId,
      status: SessionStatus.ACTIVE,
      answers: [],
    };
    const endedSession = {
      ...mockSession,
      score: 80,
      answers: [{ a: 'ans1', c: true }],
      status: SessionStatus.FINISHED,
      finishedAt: expect.any(Date),
    };

    const expectedUpdatedSession = expect.objectContaining({
      finishedAt: expect.any(Date),
      score: endSessionDto.score,
      answers: [
        expect.objectContaining({
          a: 'ans1',
          c: true,
        }),
      ],
    });

    it('should end and return the session if valid', async () => {
      sessionRepository.findById.mockResolvedValue(mockSession as any);
      sessionRepository.patch.mockResolvedValue(endedSession as any);

      const result = await service.endSession(sessionId, endSessionDto, userId);

      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).toHaveBeenCalledWith(
        sessionId,
        expectedUpdatedSession,
      );
      expect(result).toEqual(endedSession);
    });

    it('should throw SessionNotFoundException if session not found initially', async () => {
      sessionRepository.findById.mockResolvedValue(null);
      await expect(
        service.endSession(sessionId, endSessionDto, userId),
      ).rejects.toThrow(SessionNotFoundException);
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).not.toHaveBeenCalled();
    });

    it('should throw SessionAccessDenied if userId does not match session userId', async () => {
      const otherUserId = 'userX';
      sessionRepository.findById.mockResolvedValue({
        ...mockSession,
        userId: 'differentUser',
      } as any);

      await expect(
        service.endSession(
          sessionId,
          {
            ...endSessionDto,
            sessionId,
          },
          otherUserId,
        ),
      ).rejects.toThrow(SessionAccessDenied);
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).not.toHaveBeenCalled();
    });

    it('should throw SessionNotFoundException if patch fails to return session', async () => {
      sessionRepository.findById.mockResolvedValue(mockSession as any);
      sessionRepository.patch.mockResolvedValue(null);
      // sessionRepository.updateStatus.mockResolvedValue(undefined);

      await expect(
        service.endSession(sessionId, endSessionDto, userId),
      ).rejects.toThrow(SessionNotFoundException);
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).toHaveBeenCalledWith(
        sessionId,
        expectedUpdatedSession,
      );
    });

    it('should handle answers with "correct" property', async () => {
      const endSessionDtoWithCorrect = {
        sessionId,
        score: 80,
        answers: [{ a: 'ans1', correct: true }],
      };
      sessionRepository.findById.mockResolvedValue(mockSession as any);
      sessionRepository.patch.mockResolvedValue({
        ...endedSession,
        score: 80,
        answers: [{ a: 'ans1', c: true }],
      } as any);

      await service.endSession(sessionId, endSessionDtoWithCorrect, userId);

      expect(sessionRepository.patch).toHaveBeenCalledWith(
        sessionId,
        expectedUpdatedSession,
      );
    });
  });

  // --- Test cases for addAnswer method ---
  describe('addAnswer', () => {
    const sessionId = 's1';
    const userId = 'user1';
    const newAnswer = { a: 'new_answer', c: true };
    const initialSession = {
      id: sessionId,
      userId: userId,
      status: SessionStatus.ACTIVE,
      answers: [{ a: 'prev_answer', c: false }],
    };
    const updatedSessionAfterAdd = {
      ...initialSession,
      answers: [...initialSession.answers, { a: 'new_answer', c: true }],
    };

    const expectedUpdatedSession = expect.objectContaining({
      answers: [...initialSession.answers, { a: 'new_answer', c: true }],
    });

    it('should add an answer and return the updated session', async () => {
      sessionRepository.findById.mockResolvedValue(initialSession as any);
      sessionRepository.patch.mockResolvedValue(updatedSessionAfterAdd);

      const result = await service.addAnswer(sessionId, newAnswer, userId);

      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).toHaveBeenCalledWith(
        sessionId,
        expectedUpdatedSession,
      );
      expect(result).toEqual(updatedSessionAfterAdd);
    });

    it('should throw SessionNotFoundException if session not found initially', async () => {
      sessionRepository.findById.mockResolvedValue(null);

      await expect(
        service.addAnswer(sessionId, newAnswer, userId),
      ).rejects.toThrow(SessionNotFoundException);
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).not.toHaveBeenCalled();
    });

    it('should throw SessionAccessDenied if userId does not match session userId', async () => {
      const otherUserId = 'userX';
      sessionRepository.findById.mockResolvedValue({
        ...initialSession,
        userId: 'differentUser',
      } as any);

      await expect(
        service.addAnswer(sessionId, newAnswer, otherUserId),
      ).rejects.toThrow(SessionAccessDenied);
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).not.toHaveBeenCalled();
    });

    it('should throw SessionAlreadyFinishedException if session is finished', async () => {
      sessionRepository.findById.mockResolvedValue({
        ...initialSession,
        status: SessionStatus.FINISHED,
      } as any);

      await expect(
        service.addAnswer(sessionId, newAnswer, userId),
      ).rejects.toThrow(SessionAlreadyFinishedException);
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).not.toHaveBeenCalled();
    });

    it('should throw SessionNotFoundException if findById fails after update', async () => {
      sessionRepository.findById.mockResolvedValueOnce(initialSession as any);
      sessionRepository.patch.mockResolvedValueOnce(null);

      await expect(
        service.addAnswer(sessionId, newAnswer, userId),
      ).rejects.toThrow(SessionNotFoundException);
      expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
      expect(sessionRepository.patch).toHaveBeenCalled();
    });

    it('should handle answers with "correct" property', async () => {
      const newAnswerWithCorrect = { a: 'another_answer', correct: false };
      const updatedSessionWithCorrect = {
        ...initialSession,
        answers: [...initialSession.answers, { a: 'another_answer', c: false }],
      };

      sessionRepository.findById.mockResolvedValueOnce(initialSession as any);
      sessionRepository.patch.mockResolvedValue(updatedSessionWithCorrect);

      await service.addAnswer(sessionId, newAnswerWithCorrect, userId);

      expect(sessionRepository.patch).toHaveBeenCalledWith(
        sessionId,
        expect.objectContaining({
          answers: [
            ...initialSession.answers,
            expect.objectContaining({
              a: 'another_answer',
              c: false,
            }),
          ],
        }),
      );
    });
  });

  // --- Test cases for pauseSession method ---
  describe('pauseSession', () => {
    const sessionId = 's1';
    const userId = 'user1';
    const mockSession = {
      id: sessionId,
      userId: userId,
      status: SessionStatus.ACTIVE,
    };
    const pausedSession = { ...mockSession, status: SessionStatus.PAUSED };

    it('should pause the session and return it', async () => {
      sessionRepository.findById.mockResolvedValue(mockSession as any);
      sessionRepository.patch.mockResolvedValue(pausedSession);

      const result = await service.pauseSession(sessionId, userId);

      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).toHaveBeenCalledWith(
        sessionId,
        expect.objectContaining({
          status: SessionStatus.PAUSED,
        }),
      );
      expect(result).toEqual(pausedSession);
    });

    it('should throw SessionNotFoundException if session not found', async () => {
      sessionRepository.findById.mockResolvedValue(null);

      await expect(service.pauseSession(sessionId, userId)).rejects.toThrow(
        SessionNotFoundException,
      );
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).not.toHaveBeenCalled();
    });

    it('should throw SessionAccessDenied if userId does not match session userId', async () => {
      const otherUserId = 'userX';
      sessionRepository.findById.mockResolvedValue({
        ...mockSession,
        userId: 'differentUser',
      } as any);

      await expect(
        service.pauseSession(sessionId, otherUserId),
      ).rejects.toThrow(SessionAccessDenied);
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).not.toHaveBeenCalled();
    });

    it('should throw SessionAlreadyFinishedException if session is finished', async () => {
      sessionRepository.findById.mockResolvedValue({
        ...mockSession,
        status: SessionStatus.FINISHED,
      } as any);

      await expect(service.pauseSession(sessionId, userId)).rejects.toThrow(
        SessionAlreadyFinishedException,
      );
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      // expect(sessionRepository.pauseSession).not.toHaveBeenCalled();
      // expect(sessionRepository.updateStatus).not.toHaveBeenCalled();
    });
  });

  // --- Test cases for resumeSession method ---
  describe('resumeSession', () => {
    const sessionId = 's1';
    const userId = 'user1';
    const mockSession = {
      id: sessionId,
      userId: userId,
      status: SessionStatus.PAUSED,
    };
    const resumedSession = { ...mockSession, status: SessionStatus.ACTIVE };

    it('should resume the session and return it', async () => {
      sessionRepository.findById.mockResolvedValue(mockSession as any);
      sessionRepository.patch.mockResolvedValue(resumedSession as any);

      const result = await service.resumeSession(sessionId, userId);

      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).toHaveBeenCalledWith(
        sessionId,
        expect.objectContaining({
          status: SessionStatus.ACTIVE,
        }),
      );
      expect(result).toEqual(resumedSession);
    });

    it('should throw SessionNotFoundException if session not found', async () => {
      sessionRepository.findById.mockResolvedValue(null);

      await expect(service.resumeSession(sessionId, userId)).rejects.toThrow(
        SessionNotFoundException,
      );
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).not.toHaveBeenCalled();
    });

    it('should throw SessionAccessDenied if userId does not match session userId', async () => {
      const otherUserId = 'userX';
      sessionRepository.findById.mockResolvedValue({
        ...mockSession,
        userId: 'differentUser',
      } as any);

      await expect(
        service.resumeSession(sessionId, otherUserId),
      ).rejects.toThrow(SessionAccessDenied);
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).not.toHaveBeenCalled();
    });

    it('should throw SessionAlreadyFinishedException if session is finished', async () => {
      sessionRepository.findById.mockResolvedValue({
        ...mockSession,
        status: SessionStatus.FINISHED,
      } as any);

      await expect(service.resumeSession(sessionId, userId)).rejects.toThrow(
        SessionAlreadyFinishedException,
      );
      expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
      expect(sessionRepository.patch).not.toHaveBeenCalled();
    });
  });
});
