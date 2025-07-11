import { ReqUser } from '@common/types/request';
import { Quiz } from '@entities/quiz.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
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
import { Response } from 'express';
import { GetJobProgressUseCaseFactory } from '@domain/usecases/QuizGenerationUseCase';
import { QuizGenerationJobRepository } from '@repositories/quiz-generation-job.repository';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Quizzes')
@Controller('quizzes')
@ApiBearerAuth('JWT-auth')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    @Inject('QuizGenerationJobRepository')
    private readonly quizGenerationJobRepository: QuizGenerationJobRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les quiz (avec filtres)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des quiz récupérée avec succès',
    type: [Quiz],
  })
  async findAll(@Query() filters: QuizFiltersDto, @Req() req: Request & { user?: ReqUser }): Promise<Quiz[]> {
    const userId = req.user?.sub;
    return this.quizService.findAll(filters, userId);
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

  @Public()
  @Get(':id/jobs')
  getJobsEvents(@Res() res: Response, @Param('id') id: string) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    function write(payload: any) {
      res.write(`data: ${payload}\n\n`);
    }

    const getJobProgressUseCase = GetJobProgressUseCaseFactory(
      this.quizGenerationJobRepository,
    );
    const intervalId = setInterval(async () => {
      // polling mechanism
      const result = await getJobProgressUseCase({
        quizId: id,
      });

      if (result instanceof Error) {
        write(
          JSON.stringify({
            error: true,
            message: result.message,
          }),
        );
        clearInterval(intervalId);
        res.end();
        return;
      }

      write(JSON.stringify(result));
    }, 3000);

    res.on('close', () => {
      clearInterval(intervalId);
      console.log('Client disconnected');
    });
  }

  @Get('user/:id')
  @ApiOperation({
    summary: "Récupérer tous les quiz d'un utilisateur par son ID avec filtres",
  })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: "Liste des quiz de l'utilisateur récupérée avec succès",
    type: [Quiz],
  })
  async findAllByUserId(
    @Param('id') id: string,
    @Query() filters: QuizFiltersDto,
  ): Promise<Quiz[]> {
    return this.quizService.findAllByUserId(id, {
      ...filters,
      ready: true,
    });
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
    const fileArray = Array.isArray(files) ? files : files ? [files] : [];

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

  @Get('count/:userId')
  @ApiOperation({ summary: 'Compter le nombre de quiz créés par un utilisateur' })
  @ApiResponse({ status: 200, description: 'Nombre de quiz', type: Number })
  async countByUserId(@Param('userId') userId: string): Promise<{ count: number }> {
    if (!userId) {
      throw new HttpException('userId requis', HttpStatus.BAD_REQUEST);
    }
    const count = await this.quizService.countByUserId(userId);
    return { count };
  }

  @Get('media/:userId')
  @ApiOperation({ summary: 'Récupérer tous les documents (médias) d’un utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des chemins de fichiers médias', type: [String] })
  async getAllMediaByUserId(@Param('userId') userId: string): Promise<string[]> {
    return this.quizService.findAllMediaByUserId(userId);
  }
}
