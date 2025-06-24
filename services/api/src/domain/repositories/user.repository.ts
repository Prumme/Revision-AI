import { MongoUserRepository } from '@mongo/user/user.repository';
import { User } from '../entities/user.entity';

export interface UserFilters {
  includeDeleted?: boolean;
  includeBlocked?: boolean;
  onlyDeleted?: boolean;
  onlyBlocked?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(
    filters?: UserFilters,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<User>>;
  create(user: Omit<User, 'id'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<boolean>;
}

export const UserRepositoryProvider = {
  provide: 'UserRepository',
  useClass: MongoUserRepository,
};
