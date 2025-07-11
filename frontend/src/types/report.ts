export interface ReportReason {
  userId: string;
  userName: string;
  reason: string;
  createdAt: string | Date;
}

export interface Report {
  id?: string;
  _id?: string;
  type: "user" | "quiz";
  targetId: string;
  targetName: string;
  reasons?: ReportReason[];
  resolved: boolean;
  resolvedAt?: string | Date;
  resolvedBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface GetReportsParams {
  resolved?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
