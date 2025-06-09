import { ApiProperty } from '@nestjs/swagger';
import { Question } from '@common/types/question';
import {
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizDto {
  @ApiProperty({ description: "ID de l'utilisateur créant le quiz" })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Nom du quiz' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description du quiz', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Liste des questions du quiz', type: [Question] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Question)
  @ArrayMinSize(1)
  questions: Question[];

  @ApiProperty({ description: 'Tags associés au quiz', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Score de rigueur du quiz',
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  rigorScore?: number;

  @ApiProperty({
    description: 'Visibilité publique du quiz',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  public?: boolean;

  @ApiProperty({ description: 'Contexte du quiz', required: false })
  @IsString()
  @IsOptional()
  context?: string;
}
