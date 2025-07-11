import {defineStore} from 'pinia';
import {sessionService} from '@/services/session.service';
import type {Session} from '@/types/session';

export const useSessionStore = defineStore('session', {
  state: () => ({
    sessionId: null as string | null,
    quizId: null as string | null,
    session: null as Session | null,
  }),
  actions: {

    async listUserSessions(userId: string): Promise<Session[]> {
      return await sessionService.findAllByUserId(userId);
    },

    async startSession(quizId: string, userId: string) {
      const session = await sessionService.createSession({ userId, quizId });
      localStorage.setItem(`quiz.${quizId}`, session.id);
      this.sessionId = session.id;
      this.quizId = quizId;
      this.session = session;
      return session;
    },
    loadSession(quizId: string) {
      const sessionId = localStorage.getItem(`quiz.${quizId}`);
      if (sessionId) {
        this.sessionId = sessionId;
        this.quizId = quizId;
        return sessionId;
      }
      return null;
    },
    async fetchSession() {
      if (!this.sessionId) return null;
      const session = await sessionService.findById(this.sessionId);
      this.session = session;
      return session;
    },

    /**
     * Termine la session en enregistrant le score et les réponses.
     *
     * @param score
     * @param answers
     */
    async endSession(score: number, answers: []) {
      if (!this.sessionId || !this.quizId) return;
      await sessionService.endSession(this.sessionId, { score, answers });
      localStorage.removeItem(`quiz.${this.quizId}`);
      this.sessionId = null;
      this.quizId = null;
      this.session = null;
    },

    /**
     * Démarre ou crée une session de quiz.
     *
     * Si une session existe déjà pour le quiz, elle est chargée depuis le localStorage.
     * Sinon, une nouvelle session est créée via l'API.
     *
     * @param quizId - L'identifiant du quiz
     * @param userId - L'identifiant de l'utilisateur
     */
    async startOrCreateSession(quizId: string, userId: string) {
      // 1. Vérifier si une session existe déjà dans le localStorage
      const existingSessionId = localStorage.getItem(`quiz.${quizId}`);
      if (existingSessionId) {
        this.sessionId = existingSessionId;
        this.quizId = quizId;
        this.session = await sessionService.findById(existingSessionId);
        return this.session;
      }
      // 2. Sinon, créer une nouvelle session
      const session = await sessionService.createSession({ userId, quizId });
      localStorage.setItem(`quiz.${quizId}`, session.id);
      this.sessionId = session.id;
      this.quizId = quizId;
      this.session = session;
      return session;
    },
    async pauseSession() {
      if (!this.sessionId) return;
      await sessionService.pauseSession(this.sessionId);
      this.session = await sessionService.findById(this.sessionId);
    },
    async resumeSession() {
      if (!this.sessionId) return;
      await sessionService.resumeSession(this.sessionId);
      this.session = await sessionService.findById(this.sessionId);
    },
  },
});
