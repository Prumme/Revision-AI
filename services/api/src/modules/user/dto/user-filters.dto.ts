import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UserFiltersDto {
  @ApiPropertyOptional({
    description: 'Inclure les utilisateurs supprimés/anonymisés',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Inclure les utilisateurs bloqués',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeBlocked?: boolean;

  @ApiPropertyOptional({
    description: 'Récupérer seulement les utilisateurs supprimés/anonymisés',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  onlyDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Récupérer seulement les utilisateurs bloqués',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  onlyBlocked?: boolean;

  @ApiPropertyOptional({
    description:
      "Terme de recherche pour filtrer par nom d'utilisateur ou email",
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Champ pour le tri',
    example: 'username',
    enum: ['username', 'email', 'role', 'createdAt', 'emailVerified'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Direction du tri',
    example: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Numéro de la page',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number;

  @ApiPropertyOptional({
    description: "Nombre d'éléments par page",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number;
}
