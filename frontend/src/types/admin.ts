// Types pour les filtres des utilisateurs
export type BlockedFilterValue = "" | "unblocked" | "blocked" | "all";
export type DeletedFilterValue = "" | "active" | "deleted" | "all";

export interface UserTableFilters {
  blockedFilter: BlockedFilterValue;
  deletedFilter: DeletedFilterValue;
}

// Type pour les filtres API backend
export interface UserApiFilters {
  includeDeleted?: boolean;
  includeBlocked?: boolean;
  onlyDeleted?: boolean;
  onlyBlocked?: boolean;
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
