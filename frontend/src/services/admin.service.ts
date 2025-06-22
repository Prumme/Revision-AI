import { ApiService } from "./api.service";
import type { User } from "@/types/user";
import type { UserApiFilters } from "@/types/admin";

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
    const queryParams = new URLSearchParams();

    if (filters.includeDeleted) {
      queryParams.append("includeDeleted", "true");
    }
    if (filters.includeBlocked) {
      queryParams.append("includeBlocked", "true");
    }
    if (filters.onlyDeleted) {
      queryParams.append("onlyDeleted", "true");
    }
    if (filters.onlyBlocked) {
      queryParams.append("onlyBlocked", "true");
    }
    if (filters.search && filters.search.trim()) {
      queryParams.append("search", filters.search.trim());
    }
    if (filters.sortBy) {
      queryParams.append("sortBy", filters.sortBy);
    }
    if (filters.sortOrder) {
      queryParams.append("sortOrder", filters.sortOrder);
    }

    // Ajout des paramètres de pagination
    if (pagination.page) {
      queryParams.append("page", pagination.page.toString());
    }
    if (pagination.limit) {
      queryParams.append("limit", pagination.limit.toString());
    }

    const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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
}
