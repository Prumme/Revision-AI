import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber } from 'class-validator';
import { SessionStatus } from '@entities/session.entity';
import { Type } from 'class-transformer';

export class SessionFiltersDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut de session',
    enum: SessionStatus,
  })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par score minimum',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  scoreMin?: number;

  @ApiPropertyOptional({
    description: 'Filtrer par score maximum',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  scoreMax?: number;
}
