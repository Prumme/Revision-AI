import { ApiService } from "./api.service";
import type { User } from "@/types/user";
import type { UserApiFilters } from "@/types/admin";
import type { Quiz } from "@/types/quiz";
import type { Report, GetReportsParams } from "@/types/report";
import type {
  PaginationParams,
  PaginatedResponse,
  PaginatedUsersResponse,
} from "@/types/pagination";
import type { UploadedDocument } from "@/types/uploadedDocument.ts";

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

  static async blockUser(userId: string, reason: string): Promise<void> {
    await ApiService.patch(`/users/${userId}/block`, { reason }, true);
  }

  static async unblockUser(userId: string): Promise<void> {
    await ApiService.patch(`/users/${userId}/unblock`, {}, true);
  }

  static async deleteUser(userId: string): Promise<void> {
    await ApiService.delete(`/users/${userId}`);
  }

  static async getUserById(userId: string): Promise<User> {
    const response = await ApiService.get<User>(`/users/${userId}/customer`);
    return response.data;
  }

  static async getUserQuizzes(userId: string): Promise<Quiz[]> {
    try {
      const response = await ApiService.get<Quiz[]>(`/quizzes/user/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des quiz:", error);
      return [];
    }
  }

  static async getUserDocuments(
    userId: string,
    query: { page: number; limit: number } = { page: 1, limit: 10 },
  ): Promise<PaginatedResponse<UploadedDocument>> {
    try {
      const response = await ApiService.get<PaginatedResponse<UploadedDocument>>(
        `/documents/users/${userId}?page=${query.page}&limit=${query.limit}`,
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      return {
        data: [],
        total: 0,
        totalPages: 0,
        page: query.page,
        limit: query.limit,
      };
    }
  }

  static async askNewUsername(userId: string): Promise<void> {
    await ApiService.post(`/users/${userId}/ask-new-username`, {});
  }

  static async updateUserSubscription(userId: string, tier: string): Promise<void> {
    const response = await ApiService.patch<User>(`/users/${userId}/subscription`, { tier });
    if (!response.data) {
      throw new Error("Erreur lors de la mise à jour de l'abonnement");
    }
  }

  static async getReports(params: GetReportsParams): Promise<PaginatedResponse<Report>> {
    const queryParams = new URLSearchParams();

    if (params.resolved !== undefined) {
      queryParams.append("resolved", params.resolved.toString());
    }
    if (params.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params.search) {
      queryParams.append("search", params.search);
    }
    if (params.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }

    const response = await ApiService.get<PaginatedResponse<Report>>(
      `/reports?${queryParams.toString()}`,
    );
    return response.data;
  }

  static async resolveReport(reportId: string): Promise<void> {
    await ApiService.patch(`/reports/${reportId}/resolve`, {});
  }

  static async getReportById(id: string): Promise<Report> {
    const response = await ApiService.get<Report>(`/reports/${id}`);
    return response.data;
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
