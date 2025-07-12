import { AdminGuard } from '@common/guards/admin.guard';
import { ReqUser } from '@common/types/request';
import {
  ActiveSubscriptionUseCaseFactory,
  InactiveSubscriptionUseCaseFactory,
} from '@domain/usecases/SubscriptionUsecases';
import { SubscriptionTier } from '@domain/value-objects/subscriptionTier';
import { CustomerAndUser } from '@entities/customer.entity';
import { User } from '@entities/user.entity';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { QuizService } from '@modules/quiz/quiz.service';
import { UserService } from '@modules/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ConflictException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerRepository } from '@repositories/customer.repository';
import { MailerService } from '@services/MailerService';
import { Request } from 'express';
import { UserData } from '../../common/types/user-data';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFiltersDto } from './dto/user-filters.dto';

@ApiTags('Utilisateurs')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly quizService: QuizService,
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    @Inject('MailerService')
    private readonly mailer: MailerService,
  ) {}

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Récupérer tous les utilisateurs (admin seulement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs filtrée',
    type: [CreateUserDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Accès refusé : rôle admin requis',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Inclure les utilisateurs supprimés/anonymisés',
  })
  @ApiQuery({
    name: 'includeBlocked',
    required: false,
    type: Boolean,
    description: 'Inclure les utilisateurs bloqués',
  })
  @ApiQuery({
    name: 'onlyDeleted',
    required: false,
    type: Boolean,
    description: 'Récupérer seulement les utilisateurs supprimés/anonymisés',
  })
  @ApiQuery({
    name: 'onlyBlocked',
    required: false,
    type: Boolean,
    description: 'Récupérer seulement les utilisateurs bloqués',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description:
      "Terme de recherche pour filtrer par nom d'utilisateur ou email",
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Champ pour le tri',
    enum: ['username', 'email', 'role', 'createdAt', 'emailVerified'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Direction du tri',
    enum: ['asc', 'desc'],
  })
  async findAll(@Query() filters: UserFiltersDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder,
      ...userFilters
    } = filters;

    return await this.userService.findAll(
      { ...userFilters, search, sortBy, sortOrder },
      { page, limit },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: "L'utilisateur a été trouvé.",
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Get('profile/:username')
  @ApiOperation({
    summary: "Récupérer le profil public d'un utilisateur par son username",
  })
  @ApiParam({ name: 'username', description: "Username de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: "Le profil public de l'utilisateur a été trouvé.",
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            bio: { type: 'string', nullable: true },
            avatar: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        quizzes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async findPublicProfile(@Param('username') username: string) {
    const user = await this.userService.findByUsername(username);
    if (!user || user.deleted || user.blocked) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }

    // Récupérer les quiz publics de l'utilisateur
    const quizzes = await this.quizService.findAll(
      {
        userId: { id: user.id },
        isPublic: true,
        ready: true,
      },
      { ignore: true },
    );

    // Retourner seulement les informations publiques
    return {
      user: {
        id: user.id,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      quizzes: quizzes.data.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        createdAt: quiz.createdAt,
        category: quiz.category,
      })),
    };
  }

  @Get(':id/customer')
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: "L'utilisateur a été trouvé.",
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async findCustomer(@Param('id') id: string): Promise<CustomerAndUser> {
    const user = await this.customerRepository.findByUserId(id);
    if (!user) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
    return user as CustomerAndUser;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({
    status: 200,
    description: "L'utilisateur a été mis à jour.",
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: ReqUser,
  ): Promise<User> {
    try {
      // Récupérer l'utilisateur actuel pour vérifier si le username a changé
      const currentUser = await this.userService.findById(user.sub);
      if (!currentUser) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }

      // Vérifier si le username a changé
      if (
        updateUserDto.username &&
        updateUserDto.username !== currentUser.username
      ) {
        // Mettre à jour le username dans tous les quiz de l'utilisateur
        await this.quizService.updateUsernameInUserQuizzes(
          user.sub,
          updateUserDto.username,
        );
      }

      return await this.userService.update(user.sub, updateUserDto);
    } catch (error) {
      if (error.message?.includes("nom d'utilisateur existe déjà")) {
        throw new ConflictException(
          "Un utilisateur avec ce nom d'utilisateur existe déjà",
        );
      }
      if (error.message?.includes('email existe déjà')) {
        throw new ConflictException(
          'Un utilisateur avec cet email existe déjà',
        );
      }
      throw new HttpException(
        "Erreur lors de la mise à jour de l'utilisateur",
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Mettre à jour un utilisateur (admin seulement)' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: "L'utilisateur a été mis à jour.",
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Accès refusé : rôle admin requis',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      // Récupérer l'utilisateur actuel pour vérifier si le username a changé
      const currentUser = await this.userService.findById(id);
      if (!currentUser) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }

      // Vérifier si le username a changé
      if (
        updateUserDto.username &&
        updateUserDto.username !== currentUser.username
      ) {
        // Mettre à jour le username dans tous les quiz de l'utilisateur
        await this.quizService.updateUsernameInUserQuizzes(
          id,
          updateUserDto.username,
        );
      }

      return await this.userService.update(id, updateUserDto);
    } catch (error) {
      if (error.message?.includes("nom d'utilisateur existe déjà")) {
        throw new ConflictException(
          "Un utilisateur avec ce nom d'utilisateur existe déjà",
        );
      }
      if (error.message?.includes('email existe déjà')) {
        throw new ConflictException(
          'Un utilisateur avec cet email existe déjà',
        );
      }
      throw new HttpException(
        "Erreur lors de la mise à jour de l'utilisateur",
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch('me/password')
  @ApiOperation({ summary: "Mettre à jour le mot de passe d'un utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Le mot de passe a été mis à jour.',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() { user }: Request,
  ): Promise<User> {
    return await this.userService.updatePassword(user.sub, updatePasswordDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Supprimer/anonymiser le compte utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Le compte a été anonymisé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async deleteMe(@Req() { user }: Request) {
    try {
      const updatedUser = await this.userService.anonymizeAccount(user.sub);
      return {
        message: 'Compte anonymisé avec succès',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          deleted: updatedUser.deleted,
        },
      };
    } catch (error) {
      throw new HttpException(
        "Erreur lors de l'anonymisation du compte",
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Supprimer un utilisateur (admin seulement)' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: "L'utilisateur a été supprimé",
  })
  @ApiResponse({
    status: 401,
    description: 'Accès refusé : rôle admin requis',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async remove(@Param('id') id: string): Promise<void> {
    const deleted = await this.userService.delete(id);
    if (!deleted) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
  }

  @Post('me/avatar')
  @ApiOperation({ summary: "Mettre à jour l'avatar de l'utilisateur" })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @CurrentUser() user: ReqUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException(
        "Aucun fichier n'a été fourni",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Vérifier le type de fichier
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException(
        'Type de fichier non autorisé. Utilisez JPEG ou PNG',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new HttpException(
        'Le fichier est trop volumineux. Taille maximale : 5MB',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.userService.updateAvatar(user.sub, file);
    return {
      message: 'Avatar mis à jour avec succès',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
      },
    };
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: "Supprimer l'avatar de l'utilisateur" })
  async deleteAvatar(@CurrentUser() user: ReqUser) {
    return await this.userService.deleteAvatar(user.sub);
  }

  @Patch(':id/subscription')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: "Mettre à jour l'abonnement d'un utilisateur (admin seulement)",
  })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: "L'abonnement a été mis à jour.",
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async updateSubscription(
    @Param('id') id: string,
    @Body('tier') tier: SubscriptionTier,
  ): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }

    try {
      const factory =
        tier !== 'free'
          ? ActiveSubscriptionUseCaseFactory
          : InactiveSubscriptionUseCaseFactory;

      const useCase = factory(this.mailer, this.customerRepository);
      const response = await useCase({
        customerId: user.customerId,
        tier: tier,
      });

      if (response instanceof Error) {
        throw response;
      }

      return user;
    } catch (error) {
      throw new HttpException(
        "Erreur lors de la mise à jour de l'abonnement",
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('me/data')
  @ApiOperation({ summary: "Télécharger les données de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: "Les données de l'utilisateur ont été récupérées avec succès",
  })
  @ApiResponse({
    status: 401,
    description: "L'utilisateur n'est pas authentifié",
  })
  @ApiResponse({
    status: 403,
    description: "L'utilisateur n'a pas les droits nécessaires",
  })
  async downloadData(@CurrentUser() user: ReqUser): Promise<UserData> {
    try {
      return await this.userService.downloadData(user.sub);
    } catch (error) {
      throw new HttpException(
        "Erreur lors de la récupération des données de l'utilisateur",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
