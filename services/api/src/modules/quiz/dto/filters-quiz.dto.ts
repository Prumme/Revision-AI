import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QuizFiltersDto {
  @ApiPropertyOptional({
    description: 'Inclure les quiz invisibles ou supprimés',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description:
      'Terme de recherche pour filtrer les quiz par titre ou description',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Champ par lequel trier les résultats',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri des résultats',
    example: 'asc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Numéro de la page',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => {
    const val = parseInt(value, 10);
    return isNaN(val) ? 1 : val;
  })
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: "Nombre d'éléments par page",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => {
    const val = parseInt(value, 10);
    return isNaN(val) ? 10 : val;
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
