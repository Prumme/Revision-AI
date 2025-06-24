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
