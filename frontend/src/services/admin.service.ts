import { ApiService } from "./api.service";
import type { User } from "@/types/user";
import type { UserApiFilters } from "@/types/admin";
import type { Quiz } from "@/types/quiz";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AdminService {
  static async getUsers(
    filters: UserApiFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedUsersResponse> {
    const queryParams = this.buildQueryParams({ ...filters, ...pagination });

    const endpoint = `/users${queryParams.length > 0 ? `?${queryParams.join("&")}` : ""}`;

    const response = await ApiService.get<PaginatedUsersResponse>(endpoint);

    return response.data;
  }

  static async blockUser(userId: string): Promise<void> {
    await ApiService.patch(`/users/${userId}`, { blocked: true });
  }

  static async unblockUser(userId: string): Promise<void> {
    await ApiService.patch(`/users/${userId}`, { blocked: false });
  }

  static async deleteUser(userId: string): Promise<void> {
    await ApiService.delete(`/users/${userId}`);
  }

  static async getUserById(userId: string): Promise<User> {
    console.log(`/users/${userId}`);
    const response = await ApiService.get<User>(`/users/${userId}`);
    return response.data;
  }

  static async getUserQuizzes(userId: string): Promise<Quiz[]> {
    try {
      const response = await ApiService.get<Quiz[]>(`/users/${userId}/quizzes`);
      return response.data || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des quiz:", error);
      return [];
    }
  }

  static async getUserDocuments(userId: string): Promise<Document[]> {
    try {
      const response = await ApiService.get<Document[]>(`/users/${userId}/documents`);
      return response.data || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      return [];
    }
  }

  static async requestPasswordReset(userId: string): Promise<void> {
    await ApiService.post(`/users/${userId}/password-reset`, {});
  }

  private static buildQueryParams(filters: UserApiFilters): string[] {
    const queryParams: string[] = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        queryParams.push(`${key}=${value}`);
      }
    }

    return queryParams;
  }
}
