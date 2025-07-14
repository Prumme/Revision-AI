import { ApiService } from "./api.service";
import type { PaginatedResponse } from "@/types/pagination.ts";

export enum SessionStatus {
  PENDING = "pending",
  ACTIVE = "active",
  PAUSED = "paused",
  FINISHED = "finished",
}
export interface Session {
  id: string;
  quizId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: SessionStatus;
  duration: number;
  score: number;
  answers: { c: boolean; a: string }[];
}

export const sessionService = {
  async findById(id: string): Promise<Session> {
    const { data } = await ApiService.get<Session>(`/sessions/${id}`);
    return data;
  },

  async findAllByUserId(userId: string): Promise<Session[]> {
    const { data } = await ApiService.get<Session[]>(`/sessions/user/${userId}`);
    return data;
  },

  async findAllByQuizId(
    quizId: string,
    query: Record<string, string | number>,
  ): Promise<PaginatedResponse<Session>> {
    const queryParams = new URLSearchParams(query).toString();
    const response = await ApiService.get<PaginatedResponse<Session>>(
      `/sessions/quiz/${quizId}?${queryParams}`,
      true,
    );
    return response.data;
  },

  async findAllByQuizIdAndUserId(
    quizId: string,
    userId: string,
    query: Record<string, string | number>,
  ): Promise<PaginatedResponse<Session>> {
    const queryParams = new URLSearchParams(query).toString();
    const { data } = await ApiService.get<PaginatedResponse<Session>>(
      `/sessions/quiz/${quizId}/user/${userId}?${queryParams}`,
    );
    return data;
  },

  async createSession(payload: { userId: string; quizId: string }): Promise<Session> {
    const { data } = await ApiService.post<Session>("/sessions/create", payload);
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

  async pauseSession(sessionId: string): Promise<Session> {
    const { data } = await ApiService.post<Session>(`/sessions/${sessionId}/pause`, {});
    return data;
  },

  async resumeSession(sessionId: string): Promise<Session> {
    const { data } = await ApiService.post<Session>(`/sessions/${sessionId}/resume`, {});
    return data;
  },
};
