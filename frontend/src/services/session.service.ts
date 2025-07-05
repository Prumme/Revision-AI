import { ApiService } from './api.service';
import type { Session } from '@/types/session';

export const sessionService = {
  async findById(id: string): Promise<Session> {
    const { data } = await ApiService.get<Session>(`/sessions/${id}`);
    return data;
  },

  async findAllByUserId(userId: string): Promise<Session[]> {
    const { data } = await ApiService.get<Session[]>(`/sessions/user/${userId}`);
    return data;
  },

  async createSession(payload: { userId: string; quizId: string}): Promise<Session> {
    const { data } = await ApiService.post<Session>('/sessions/create', payload);
    return data;
  },

  async startSession(id: string): Promise<Session> {
    const { data } = await ApiService.post<Session>(`/sessions/${id}/start`, {});
    return data;
  },

  async endSession(sessionId: string, payload: { score: number; answers: [] }): Promise<Session> {
    const { data } = await ApiService.post<Session>(`/sessions/end`, { sessionId, ...payload });
    return data;
  },

  async addAnswer(sessionId: string, answer: []): Promise<Session> {
    const { data } = await ApiService.post<Session>(`/sessions/${sessionId}/answer`, answer);
    return data;
  },
};
