import { User } from '@entities/user.entity';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@repositories/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async create(createUserDto: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user: Omit<User, 'id'> = {
      ...createUserDto,
      password: hashedPassword,
      lastUpdatedPassword: new Date(),
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.userRepository.create(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }

    return this.userRepository.update(id, {
      ...updateUserDto,
    });
  }

  async updatePassword(id: string, password: string): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userRepository.update(id, {
      password: hashedPassword,
      lastUpdatedPassword: new Date(),
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }
}
