import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class AnswerDto {
  @ApiProperty({
    description: 'Texte de la réponse',
    example: 'En 1638',
  })
  @IsString()
  a: string;

  @ApiProperty({
    description: 'Indique si cette réponse est la bonne',
    example: true,
  })
  @IsBoolean()
  correct: boolean;
}

class QuestionDto {
  @ApiProperty({
    description: 'Texte de la question',
    example: 'Quand est né Louis XIV ?',
  })
  @IsString()
  q: string;

  @ApiProperty({
    description: 'Liste des réponses possibles à la question',
    type: [AnswerDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class CreateQuizDto {
  @ApiProperty({
    description: 'ID de l’utilisateur créant le quiz',
    example: '1234567890abcdef12345678',
  })
  userId: string;

  @ApiProperty({
    description: 'Titre du quiz',
    example: "Mon super quiz d'histoire",
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Catégorie du quiz (ex: Histoire, Science, etc.)',
    example: 'Histoire',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Nombre total de questions dans le quiz',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  questionsNumbers?: number;

  @ApiProperty({
    description: 'Description détaillée du quiz',
    example: 'Ce quiz porte sur les grands événements historiques.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Définit si le quiz est accessible publiquement',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublic?: boolean;

  @ApiProperty({
    description: 'URL du média associé au quiz (image, vidéo, etc.)',
    example: 'https://monstockage.com/media/quiz-cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  medias?: string[];

  @ApiProperty({
    description: 'Statut du quiz (par défaut "pending")',
    example: 'pending',
    required: false,
  })
  @IsString()
  status?: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';

  @ApiProperty({
    description: 'Date de création du quiz (générée automatiquement)',
    example: new Date().toISOString(),
    required: false,
  })
  @IsString()
  createdAt?: string = new Date().toISOString();

  @ApiProperty({
    description:
      'Date de dernière mise à jour du quiz (générée automatiquement)',
    example: new Date().toISOString(),
    required: false,
  })
  @IsString()
  updatedAt?: string = new Date().toISOString();
}
