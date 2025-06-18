import { User } from '@entities/user.entity';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@repositories/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { MinioService } from '@modules/minio/minio.service';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly minioService: MinioService,
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
    const user = await this.userRepository.findById(id);
    console.log(user);
    return user;
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

  async verifyEmail(id: string): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }
    return this.userRepository.update(id, { emailVerified: true });
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

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Si l'utilisateur a déjà un avatar, on le supprime de MinIO
    if (user.avatar) {
      await this.minioService.deleteFile('avatars/' + user.avatar);
    }

    // Générer un nom unique pour le fichier
    const fileExtension = file.originalname.split('.').pop();
    const objectName = `${userId}-${Date.now()}.${fileExtension}`;

    // Upload du nouveau fichier
    await this.minioService.uploadFile(file, 'avatars/' + objectName);

    // Stocker uniquement le nom du fichier dans la base de données
    return this.userRepository.update(userId, { avatar: objectName });
  }

  async deleteAvatar(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (user.avatar) {
      const avatarKey = user.avatar.split('/').pop();
      if (avatarKey) {
        await this.minioService.deleteFile(avatarKey);
      }
    }

    return this.userRepository.update(userId, { avatar: null });
  }
}
