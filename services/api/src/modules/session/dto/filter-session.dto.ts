import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { SessionStatus } from '@entities/session.entity';

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
  scoreMin?: number;

  @ApiPropertyOptional({
    description: 'Filtrer par score maximum',
    example: 100,
  })
  @IsOptional()
  scoreMax?: number;
}
