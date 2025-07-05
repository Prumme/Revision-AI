import { ApiService } from "./api.service";
import type { User } from "@/types/user";
import type { UserApiFilters } from "@/types/admin";
import type { Quiz } from "@/types/quiz";
import type { Invoice } from "@/types/invoice";

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
    const response = await ApiService.get<User>(`/users/${userId}/customer`);
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

  static async getUserInvoices(customerId: string): Promise<Invoice[]> {
    const response = await ApiService.get<{ invoices: Invoice[] }>(
      `/subscription/invoices/${customerId}`,
    );
    return response.data?.invoices || [];
  }

  static async updateUserSubscription(userId: string, tier: string): Promise<void> {
    const response = await ApiService.patch<User>(`/users/${userId}/subscription`, { tier });
    if (!response.data) {
      throw new Error("Erreur lors de la mise à jour de l'abonnement");
    }
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
