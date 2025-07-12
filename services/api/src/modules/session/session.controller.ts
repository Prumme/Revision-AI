import {Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { StartSessionDto } from './dto/start-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { Session } from '@entities/session.entity';
import { ReqUser } from "@common/types/request";
import { CreateSessionDto } from "@modules/session/dto/create-session.dto";
import {SessionFiltersDto} from "@modules/session/dto/filter-session.dto";

@ApiTags('Sessions')
@Controller('sessions')
@ApiBearerAuth('JWT-auth')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une session par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la session' })
  @ApiResponse({
    status: 200,
    description: 'Session trouvée avec succès',
    type: Session,
  })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  async findById(@Param('id') id: string): Promise<Session> {
    const session = await this.sessionService.findById(id);
    if (!session) {
      throw new HttpException('Session non trouvée', HttpStatus.NOT_FOUND);
    }
    return session;
  }

  @Get('user/:userId')
  @ApiOperation({ summary: "Récupérer toutes les sessions d'un utilisateur" })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Liste des sessions récupérée avec succès',
    type: [Session],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'active', 'paused', 'finished'],
    description: 'Filtrer par statut de session',
  })
  @ApiQuery({
    name: 'scoreMin',
    required: false,
    type: Number,
    description: 'Filtrer par score minimum',
  })
  @ApiQuery({
    name: 'scoreMax',
    required: false,
    type: Number,
    description: 'Filtrer par score maximum',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Numéro de page pour la pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre d\'éléments par page',
  })
  async findAllByUserId(
    @Param('userId') userId: string,
    @Query() filters: SessionFiltersDto & { page?: number; limit?: number }
  ): Promise<any> {
    const { scoreMin, scoreMax, status, page = 1, limit = 10 } = filters;
    return this.sessionService.findAllByUserId(userId, { scoreMin, scoreMax, status }, { page: Number(page), limit: Number(limit) });
  }

  @Post('create')
  @ApiOperation({ summary: 'Créer une nouvelle session' })
  @ApiResponse({
    status: 201,
    description: 'Session créée avec succès',
    type: Session,
  })
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
    @Req() { user }: Request & { user: ReqUser },
  ): Promise<Session> {
    const userId = user.sub;
    if (!userId) throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    return this.sessionService.createSession({ ...createSessionDto, userId });
  }

  @Post('start')
  @ApiOperation({ summary: 'Démarrer une session existante' })
  @ApiResponse({
    status: 201,
    description: 'Session démarrée avec succès',
    type: Session,
  })
  async startSession(
    @Body() startSessionDto: StartSessionDto,
    @Req() { user }: Request & { user: ReqUser },
  ): Promise<Session> {
    return this.sessionService.startSession(startSessionDto.sessionId);
  }

  @Post('end')
  @ApiOperation({ summary: 'Terminer une session' })
  @ApiResponse({
    status: 200,
    description: 'Session terminée avec succès',
    type: Session,
  })
  async endSession(
    @Body() endSessionDto: EndSessionDto,
    @Req() { user }: Request & { user: ReqUser },
  ): Promise<Session> {
    return this.sessionService.endSession(endSessionDto.sessionId, endSessionDto, user.sub);
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Ajouter une réponse à la session' })
  @ApiResponse({ status: 200, description: 'Réponse ajoutée', type: Session })
  async addAnswer(
    @Param('id') id: string,
    @Body() answer: any,
    @Req() { user }: Request & { user: ReqUser },
  ): Promise<Session> {
    return this.sessionService.addAnswer(id, answer, user.sub);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Mettre une session en pause' })
  @ApiResponse({ status: 200, description: 'Session mise en pause', type: Session })
  async pauseSession(
    @Param('id') id: string,
    @Req() { user }: Request & { user: ReqUser },
  ): Promise<Session> {
    return this.sessionService.pauseSession(id, user.sub);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Reprendre une session en pause' })
  @ApiResponse({ status: 200, description: 'Session reprise', type: Session })
  async resumeSession(
    @Param('id') id: string,
    @Req() { user }: Request & { user: ReqUser },
  ): Promise<Session> {
    return this.sessionService.resumeSession(id, user.sub);
  }

  @Get('quiz/:quizId')
  @ApiOperation({ summary: "Récupérer toutes les sessions d'un quiz (tous utilisateurs sauf moi)" })
  @ApiParam({ name: 'quizId', description: 'ID du quiz' })
  @ApiResponse({
    status: 200,
    description: 'Liste des sessions du quiz récupérée avec succès (hors moi)',
    type: [Session],
  })
  async findAllByQuizId(
    @Param('quizId') quizId: string,
    @Req() { user }: Request & { user: ReqUser },
  ): Promise<Session[]> {
    return this.sessionService.findAllByQuizId(quizId, user.sub);
  }

  @Get('quiz/:quizId/user/:userId')
  @ApiOperation({ summary: "Récupérer toutes les sessions d'un quiz pour un utilisateur spécifique avec filtres et pagination" })
  @ApiParam({ name: 'quizId', description: 'ID du quiz' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'active', 'paused', 'finished'], description: 'Filtrer par statut de session' })
  @ApiQuery({ name: 'scoreMin', required: false, type: Number, description: 'Filtrer par score minimum' })
  @ApiQuery({ name: 'scoreMax', required: false, type: Number, description: 'Filtrer par score maximum' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page pour la pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page' })
  async findAllByQuizIdAndUserId(
    @Param('quizId') quizId: string,
    @Param('userId') userId: string,
    @Query() filters: SessionFiltersDto & { page?: number; limit?: number }
  ): Promise<any> {
    const { scoreMin, scoreMax, status, page = 1, limit = 10 } = filters;
    return this.sessionService.findAllByQuizIdAndUserId(
      quizId,
      userId,
      { scoreMin, scoreMax, status },
    );
  }
}
