import { ApiProperty } from '@nestjs/swagger';
import { Question } from '@common/types/question';
import {
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateQuizDto {
  @ApiProperty({ description: 'Nom du quiz', required: false })
  @IsString()
  @IsOptional()
  name?: string;

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

  @ApiProperty({ description: 'Tags associés au quiz', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Score de rigueur du quiz', required: false })
  @IsNumber()
  @IsOptional()
  rigorScore?: number;

  @ApiProperty({ description: 'Visibilité publique du quiz', required: false })
  @IsBoolean()
  @IsOptional()
  public?: boolean;

  @ApiProperty({ description: 'Contexte du quiz', required: false })
  @IsString()
  @IsOptional()
  context?: string;
}
