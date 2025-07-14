import { Question } from '@common/types/question';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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

  @ApiProperty({ description: 'Visibilité publique du quiz', required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean;
}
