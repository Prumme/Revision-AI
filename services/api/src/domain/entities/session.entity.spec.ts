import {
  startSession,
  resumeSession,
  pauseSession,
  addAnswer,
  putAnswers,
  putScore,
  endSession,
  Session,
  SessionAnswer,
  SessionStatus,
} from './session.entity'; // Adjust the path to your utility file
import { v4 as uuidv4 } from 'uuid';

// Mock uuidv4 to return a predictable ID for testing
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('Session Utility Functions', () => {
  // Mock Date for consistent `startedAt`, `finishedAt`, and `duration`
  const MOCK_START_TIME = new Date('2024-07-10T10:00:00.000Z');
  const MOCK_END_TIME = new Date('2024-07-10T10:05:00.000Z'); // 5 minutes later
  const MOCK_DURATION_SECONDS = 300; // 5 minutes * 60 seconds

  let realDate: typeof Date;

  beforeAll(() => {
    // Store original Date to restore later
    realDate = global.Date;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue('mock-uuid-123');

    // Mock Date for consistent time-based calculations
    global.Date = class extends realDate {
      constructor(dateString?: string | number | Date) {
        super();
        if (dateString) {
          return new realDate(dateString);
        }
        // Return a fixed time when Date() is called without arguments
        return MOCK_END_TIME; // Default for `new Date()` calls
      }

      static now() {
        return MOCK_END_TIME.getTime(); // For Date.now()
      }
    } as typeof Date;
  });

  afterAll(() => {
    // Restore original Date object
    global.Date = realDate;
  });

  describe('startSession', () => {
    it('should create a new session with correct initial properties', () => {
      const quizId = 'quiz-abc';
      const userId = 'user-xyz';

      // Temporarily mock Date for startedAt specific to this test
      const tempRealDate = global.Date;
      global.Date = class extends realDate {
        constructor() {
          super();
          return MOCK_START_TIME;
        }
      } as typeof Date;

      const session = startSession(quizId, userId);

      expect(session).toEqual({
        id: 'mock-uuid-123',
        quizId: quizId,
        userId: userId,
        startedAt: MOCK_START_TIME,
        finishedAt: null,
        score: 0,
        duration: 0,
        answers: [],
        status: SessionStatus.ACTIVE,
      });

      global.Date = tempRealDate; // Restore Date
    });

    it('should create a session without userId if not provided', () => {
      const quizId = 'quiz-abc';

      const tempRealDate = global.Date;
      global.Date = class extends realDate {
        constructor() {
          super();
          return MOCK_START_TIME;
        }
      } as typeof Date;

      const session = startSession(quizId);

      expect(session.userId).toBeUndefined();
      expect(session.quizId).toBe(quizId);
      expect(session.startedAt).toEqual(MOCK_START_TIME);

      global.Date = tempRealDate;
    });
  });

  describe('resumeSession', () => {
    it('should set session status to ACTIVE and clear finishedAt and duration', () => {
      const initialSession: Session = {
        id: 's1',
        quizId: 'q1',
        userId: 'u1',
        startedAt: new Date(),
        finishedAt: new Date(),
        score: 50,
        duration: 120,
        answers: [{ a: 'ans1', c: true }],
        status: SessionStatus.PAUSED,
      };

      const resumed = resumeSession(initialSession);

      expect(resumed.status).toBe(SessionStatus.ACTIVE);
      expect(resumed.finishedAt).toBeUndefined();
      expect(resumed.duration).toBeUndefined();
      // Ensure other properties remain unchanged
      expect(resumed.id).toBe(initialSession.id);
      expect(resumed.score).toBe(initialSession.score);
      expect(resumed.answers).toEqual(initialSession.answers);
    });

    it('should not modify a session already active', () => {
      const initialSession: Session = {
        id: 's1',
        quizId: 'q1',
        userId: 'u1',
        startedAt: new Date(),
        finishedAt: null,
        score: 0,
        duration: 0,
        answers: [],
        status: SessionStatus.ACTIVE,
      };

      const resumed = resumeSession(initialSession);

      expect(resumed.status).toBe(SessionStatus.ACTIVE);
      expect(resumed.finishedAt).toBeUndefined(); // Still undefined as it was null
      expect(resumed.duration).toBeUndefined(); // Still undefined as it was 0
      expect(resumed).toEqual({
        ...initialSession,
        finishedAt: undefined, // transformed from null to undefined
        duration: undefined, // transformed from 0 to undefined
      });
    });
  });

  describe('pauseSession', () => {
    it('should set session status to PAUSED', () => {
      const initialSession: Session = {
        id: 's1',
        quizId: 'q1',
        userId: 'u1',
        startedAt: new Date(),
        finishedAt: null,
        score: 0,
        duration: 0,
        answers: [],
        status: SessionStatus.ACTIVE,
      };

      const paused = pauseSession(initialSession);

      expect(paused.status).toBe(SessionStatus.PAUSED);
      // Ensure other properties remain unchanged
      expect(paused.id).toBe(initialSession.id);
      expect(paused.answers).toEqual(initialSession.answers);
      expect(paused.finishedAt).toBe(initialSession.finishedAt);
    });

    it('should not modify a session already paused', () => {
      const initialSession: Session = {
        id: 's1',
        quizId: 'q1',
        userId: 'u1',
        startedAt: new Date(),
        finishedAt: null,
        score: 0,
        duration: 0,
        answers: [],
        status: SessionStatus.PAUSED,
      };

      const paused = pauseSession(initialSession);

      expect(paused.status).toBe(SessionStatus.PAUSED);
      expect(paused).toEqual(initialSession);
    });
  });

  describe('addAnswer', () => {
    it('should add a new answer to the session answers array', () => {
      const initialSession: Session = {
        id: 's1',
        quizId: 'q1',
        userId: 'u1',
        startedAt: new Date(),
        finishedAt: null,
        score: 0,
        duration: 0,
        answers: [{ a: 'old_answer_1', c: true }],
        status: SessionStatus.ACTIVE,
      };
      const newAnswer: SessionAnswer = { a: 'new_answer_2', c: false };

      const updatedSession = addAnswer(initialSession, newAnswer);

      expect(updatedSession.answers).toEqual([
        { a: 'old_answer_1', c: true },
        { a: 'new_answer_2', c: false },
      ]);
      // Ensure other properties remain unchanged
      expect(updatedSession.id).toBe(initialSession.id);
      expect(updatedSession.score).toBe(initialSession.score);
    });

    it('should correctly add the first answer to an empty array', () => {
      const initialSession: Session = {
        id: 's1',
        quizId: 'q1',
        userId: 'u1',
        startedAt: new Date(),
        finishedAt: null,
        score: 0,
        duration: 0,
        answers: [],
        status: SessionStatus.ACTIVE,
      };
      const newAnswer: SessionAnswer = { a: 'first_answer', c: true };

      const updatedSession = addAnswer(initialSession, newAnswer);

      expect(updatedSession.answers).toEqual([{ a: 'first_answer', c: true }]);
    });
  });

  describe('putAnswers', () => {
    it('should replace all existing answers with the new array', () => {
      const initialSession: Session = {
        id: 's1',
        quizId: 'q1',
        userId: 'u1',
        startedAt: new Date(),
        finishedAt: null,
        score: 0,
        duration: 0,
        answers: [{ a: 'old_answer_1', c: true }],
        status: SessionStatus.ACTIVE,
      };
      const newAnswers: SessionAnswer[] = [
        { a: 'new_answer_1', c: false },
        { a: 'new_answer_2', c: true },
      ];

      const updatedSession = putAnswers(initialSession, newAnswers);

      expect(updatedSession.answers).toEqual(newAnswers);
      // Ensure other properties remain unchanged
      expect(updatedSession.id).toBe(initialSession.id);
      expect(updatedSession.score).toBe(initialSession.score);
    });

    it('should set answers to an empty array if an empty array is provided', () => {
      const initialSession: Session = {
        id: 's1',
        quizId: 'q1',
        userId: 'u1',
        startedAt: new Date(),
        finishedAt: null,
        score: 0,
        duration: 0,
        answers: [{ a: 'old_answer_1', c: true }],
        status: SessionStatus.ACTIVE,
      };
      const newAnswers: SessionAnswer[] = [];

      const updatedSession = putAnswers(initialSession, newAnswers);

      expect(updatedSession.answers).toEqual([]);
    });
  });

  describe('putScore', () => {
    it('should update the session score', () => {
      const initialSession: Session = {
        id: 's1',
        quizId: 'q1',
        userId: 'u1',
        startedAt: new Date(),
        finishedAt: null,
        score: 50,
        duration: 0,
        answers: [],
        status: SessionStatus.ACTIVE,
      };
      const newScore = 85;

      const updatedSession = putScore(initialSession, newScore);

      expect(updatedSession.score).toBe(newScore);
      // Ensure other properties remain unchanged
      expect(updatedSession.id).toBe(initialSession.id);
      expect(updatedSession.answers).toEqual(initialSession.answers);
    });
  });

  describe('endSession', () => {
    it('should set status to FINISHED, set finishedAt, and calculate duration', () => {
      const initialSession: Session = {
        id: 's1',
        quizId: 'q1',
        userId: 'u1',
        startedAt: MOCK_START_TIME, // Use mock start time
        finishedAt: null,
        score: 0,
        duration: 0,
        answers: [],
        status: SessionStatus.ACTIVE,
      };

      const endedSession = endSession(initialSession);

      expect(endedSession.status).toBe(SessionStatus.FINISHED);
      expect(endedSession.finishedAt).toEqual(MOCK_END_TIME); // Should be the mocked Date.now()
      expect(endedSession.duration).toBe(MOCK_DURATION_SECONDS); // (MOCK_END_TIME - MOCK_START_TIME) / 1000
      expect(endedSession.id).toBe(initialSession.id);
      expect(endedSession.score).toBe(initialSession.score);
    });

    it('should handle session without startedAt gracefully for duration calculation', () => {
      const initialSession: Session = {
        id: 's1',
        quizId: 'q1',
        userId: 'u1',
        startedAt: undefined, // No startedAt
        finishedAt: null,
        score: 0,
        duration: 0,
        answers: [],
        status: SessionStatus.ACTIVE,
      };

      const endedSession = endSession(initialSession);

      expect(endedSession.status).toBe(SessionStatus.FINISHED);
      expect(endedSession.finishedAt).toEqual(MOCK_END_TIME);
      expect(endedSession.duration).toBeUndefined(); // Duration should be undefined if startedAt is missing
    });
  });
});
