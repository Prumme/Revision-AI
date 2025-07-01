import { ReqUser } from '@common/types/request';
import { Quiz } from '@entities/quiz.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QuizFiltersDto } from './dto/filters-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizService } from './quiz.service';

@ApiTags('Quizzes')
@Controller('quizzes')
@ApiBearerAuth('JWT-auth')
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les quiz' })
  @ApiResponse({
    status: 200,
    description: 'Liste des quiz récupérée avec succès',
    type: [Quiz],
  })
  async findAll(): Promise<Quiz[]> {
    return this.quizService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un quiz par son ID' })
  @ApiParam({ name: 'id', description: 'ID du quiz' })
  @ApiResponse({
    status: 200,
    description: 'Quiz trouvé avec succès',
    type: Quiz,
  })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé' })
  async findById(@Param('id') id: string): Promise<Quiz> {
    const quiz = await this.quizService.findById(id);
    if (!quiz) {
      throw new HttpException('Quiz non trouvé', HttpStatus.NOT_FOUND);
    }
    return quiz;
  }

  @Get('user/:id')
  @ApiOperation({ summary: "Récupérer tous les quiz d'un utilisateur par son ID avec filtres" })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: "Liste des quiz de l'utilisateur récupérée avec succès",
    type: [Quiz],
  })
  async findAllByUserId(
    @Param('id') id: string,
    @Query() filters: QuizFiltersDto
  ): Promise<Quiz[]> {
    return this.quizService.findAllByUserId(id, filters);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Créer un nouveau quiz' })
  @ApiResponse({
    status: 201,
    description: 'Le quiz a été créé avec succès.',
    type: Quiz,
  })
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() { user }: Request & { user: ReqUser },
  ): Promise<Quiz> {
    // S'assurer que files est un tableau
    const fileArray = Array.isArray(files) ? files : files ? [files] : [];

    console.log('------ CRÉATION DE QUIZ ------');
    console.log('Files received:', fileArray?.length || 0);
    if (fileArray.length > 0) {
      console.log('File details:', fileArray.map(f => ({
        name: f.originalname,
        size: f.size,
        mimetype: f.mimetype
      })));
    }
    console.log('createQuizDto:', JSON.stringify(createQuizDto));
    console.log('-----------------------------');

    return this.quizService.create(
      { ...createQuizDto, userId: user.sub },
      fileArray,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un quiz existant' })
  @ApiParam({ name: 'id', description: 'ID du quiz' })
  @ApiResponse({
    status: 200,
    description: 'Quiz mis à jour avec succès',
    type: Quiz,
  })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé' })
  async update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ): Promise<Quiz> {
    const updatedQuiz = await this.quizService.update(id, updateQuizDto);
    if (!updatedQuiz) {
      throw new HttpException('Quiz non trouvé', HttpStatus.NOT_FOUND);
    }
    return updatedQuiz;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un quiz' })
  @ApiParam({ name: 'id', description: 'ID du quiz' })
  @ApiResponse({ status: 200, description: 'Quiz supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé' })
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.quizService.delete(id);
    if (!deleted) {
      throw new HttpException('Quiz non trouvé', HttpStatus.NOT_FOUND);
    }
  }
}
