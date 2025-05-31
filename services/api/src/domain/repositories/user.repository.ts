import { MongoUserRepository } from '@mongo/user/user.repository';
import { User } from '../entities/user.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: Omit<User, 'id'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<boolean>;
}

export const UserRepositoryProvider = {
  provide: 'UserRepository',
  useClass: MongoUserRepository,
};
