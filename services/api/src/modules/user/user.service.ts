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
import { CustomerRepository } from '@repositories/customer.repository';
import { QuizRepository } from '@repositories/quiz.repository';
import { UserData } from '@common/types/user-data';
import { Customer, CustomerAndUser } from '@entities/customer.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    @Inject('QuizRepository')
    private readonly quizRepository: QuizRepository,
    private readonly minioService: MinioService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: RegisterDto): Promise<User> {
    // Vérifier l'unicité de l'email
    const existingUserByEmail = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUserByEmail) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Vérifier l'unicité du username
    const existingUserByUsername = await this.userRepository.findByUsername(
      createUserDto.username,
    );
    if (existingUserByUsername) {
      throw new Error("Un utilisateur avec ce nom d'utilisateur existe déjà");
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user: Omit<User, 'id'> = {
      ...createUserDto,
      password: hashedPassword,
      lastUpdatedPassword: new Date(),
      emailVerified: false,
      role: 'user',
      subscriptionTier: 'free', // Niveau d'abonnement par défaut
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
      lastModifiedUsernameAsked: null,
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

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }

    // Si le username est en cours de modification, vérifier l'unicité
    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const existingUserByUsername = await this.userRepository.findByUsername(
        updateUserDto.username,
      );
      if (existingUserByUsername && existingUserByUsername.id !== id) {
        throw new Error("Un utilisateur avec ce nom d'utilisateur existe déjà");
      }
    }

    // Si l'email est en cours de modification, vérifier l'unicité
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const existingUserByEmail = await this.userRepository.findByEmail(
        updateUserDto.email,
      );
      if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
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

  async resetPassword(id: string, newPassword: string): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

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

    // Anonymiser tous les quiz créés par l'utilisateur
    const userQuizzes = await this.quizRepository.findAll(
      { userId: { id: userId } },
      { ignore: true },
    );

    // Mettre à jour le username de chaque quiz
    for (const quiz of userQuizzes.data) {
      await this.quizRepository.update(quiz.id, {
        username: 'Utilisateur Supprimé',
        updatedAt: new Date(),
      });
    }

    // Générer un email anonyme unique basé sur l'ID de l'utilisateur
    const anonymizedEmail = `deleted_${userId.slice(0, 8)}@deleted.com`;
    const anonymizedUsername = `deleted_${userId.slice(0, 8)}`;

    // Mettre à jour l'utilisateur avec les données anonymisées
    const updatedUser = await this.userRepository.update(userId, {
      email: anonymizedEmail,
      username: anonymizedUsername,
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

  async updateSubscription(userId: string, tier: string): Promise<User> {
    if (!['free', 'basic', 'pro'].includes(tier)) {
      throw new Error("Type d'abonnement invalide");
    }

    return this.userRepository.update(userId, {
      subscriptionTier: tier,
      updatedAt: new Date(),
    });
  }
  async downloadData(userId: string): Promise<UserData> {
    // Récupérer l'utilisateur
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Récupérer les données du customer si elles existent
    const customerAndUser = await this.customerRepository.findByUserId(userId);
    const customer =
      customerAndUser && 'customerId' in customerAndUser
        ? ({
            customerId: customerAndUser.customerId,
            firstName: (customerAndUser as CustomerAndUser).firstName,
            lastName: (customerAndUser as CustomerAndUser).lastName,
            subscriptionTier: (customerAndUser as CustomerAndUser)
              .subscriptionTier,
            address: (customerAndUser as CustomerAndUser).address,
          } as Customer)
        : undefined;

    // Récupérer tous les quiz de l'utilisateur
    const quizzes = await this.quizRepository.findAll({}, { ignore: true });
    const userQuizzes = quizzes.data.filter((quiz) => quiz.userId === userId);

    return {
      user,
      customer,
      quizzes: userQuizzes,
    };
  }

  async block(id: string, reason: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    this.mailService.sendBlockUserEmail(user.email, {
      username: user.username,
      appealLink: 'https://www.google.com',
      reason: reason,
    });
    return this.userRepository.update(id, { blocked: true });
  }

  async unblock(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    this.mailService.sendUnblockUserEmail(user.email, {
      username: user.username,
    });
    return this.userRepository.update(id, { blocked: false });
  }

  async askNewUsername(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    this.mailService.sendAskNewUsernameEmail(user.email, {
      username: user.username,
    });

    return this.userRepository.update(id, {
      lastModifiedUsernameAsked: new Date(),
    });
  }
}
