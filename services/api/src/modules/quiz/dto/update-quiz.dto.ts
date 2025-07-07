import { Question } from '@common/types/question';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateQuizDto {
  @ApiProperty({ description: 'Titre du quiz', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Catégorie du quiz', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Description du quiz', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Liste des questions du quiz',
    type: [Question],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Question)
  @IsOptional()
  questions?: Question[];

  @ApiProperty({ description: 'Nombre de questions', required: false })
  @IsNumber()
  @IsOptional()
  questionsNumbers?: number;

  @ApiProperty({ description: 'Visibilité publique du quiz', required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ description: 'Médias associés au quiz', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  media?: string[];

  @ApiProperty({
    description: 'Statut du quiz',
    enum: ['pending', 'processing', 'completed', 'failed'],
    required: false,
  })
  @IsEnum(['pending', 'processing', 'completed', 'failed'])
  @IsOptional()
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}
