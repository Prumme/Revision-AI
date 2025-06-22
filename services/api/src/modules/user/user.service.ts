import { User } from '@entities/user.entity';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { Inject, Injectable } from '@nestjs/common';
import {
  UserRepository,
  UserFilters,
  PaginationOptions,
  PaginatedResult,
} from '@repositories/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { MinioService } from '@modules/minio/minio.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { MailService } from '@infrastructure/resend/mail.service';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly minioService: MinioService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user: Omit<User, 'id'> = {
      ...createUserDto,
      password: hashedPassword,
      lastUpdatedPassword: new Date(),
      emailVerified: false,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
    };
    return this.userRepository.create(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findAll(
    filters: UserFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<User>> {
    return this.userRepository.findAll(filters, pagination);
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

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }

    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new Error('Mot de passe incorrect');
    }

    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

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

  async anonymizeAccount(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const email = user.email;
    const username = user.username;

    // Supprimer l'avatar si présent
    if (user.avatar) {
      await this.deleteAvatar(userId);
    }

    // Générer un email anonyme unique basé sur l'ID de l'utilisateur
    const anonymizedEmail = `deleted_${userId.slice(0, 8)}@deleted.com`;

    // Mettre à jour l'utilisateur avec les données anonymisées
    const updatedUser = await this.userRepository.update(userId, {
      email: anonymizedEmail,
      username: 'Utilisateur supprimé',
      bio: null,
      avatar: null,
      deleted: true,
      updatedAt: new Date(),
    });

    await this.mailService.sendDeleteAccountEmail(email, {
      username,
    });

    return updatedUser;
  }
}
