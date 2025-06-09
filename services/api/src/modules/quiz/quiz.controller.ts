import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { Quiz } from '@entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@ApiTags('Quizzes')
@Controller('quizzes')
@ApiBearerAuth('JWT-auth')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

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

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau quiz' })
  @ApiResponse({
    status: 201,
    description: 'Quiz créé avec succès',
    type: Quiz,
  })
  async create(@Body() createQuizDto: CreateQuizDto): Promise<Quiz> {
    return this.quizService.create(createQuizDto);
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
