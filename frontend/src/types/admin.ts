// Types pour les filtres des utilisateurs
export type BlockedFilterValue = "all" | "blocked" | "unblocked";
export type DeletedFilterValue = "all" | "deleted" | "active";

export interface UserApiFilters {
  onlyBlocked?: boolean;
  includeBlocked?: boolean;
  onlyDeleted?: boolean;
  includeDeleted?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserTableFilters {
  blockedFilter: BlockedFilterValue;
  deletedFilter: DeletedFilterValue;
}

export interface Report {
  id: string;
  type: "user" | "quiz";
  targetId: string;
  targetName: string;
  createdAt: string;
  updatedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface GetReportsParams {
  resolved?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Types pour d'autres entités admin (extensible)
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  deletedUsers: number;
}

// Types pour la pagination côté admin
export interface AdminPaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
