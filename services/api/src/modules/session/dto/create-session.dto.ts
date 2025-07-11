import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  ValidateNested,
} from 'class-validator';

export class SessionAnswerDto {
  @ApiProperty({ description: 'La réponse choisie', example: 'Réponse A' })
  a: string;

  @ApiProperty({ description: 'La réponse est-elle correcte ?', example: true })
  correct: boolean;
}

export class CreateSessionDto {
  @IsString()
  @ApiProperty({
    description: 'ID du quiz auquel la session est associée',
    example: '1234567890abcdef12345678',
  })
  quizId: string;

  @IsString()
  @ApiProperty({
    description: 'ID de l’utilisateur qui a créé la session',
    example: '1234567890abcdef12345678',
  })
  userId: string;

  @IsOptional()
  @IsDate()
  @ApiProperty({
    description: 'Date de début de la session',
    example: '2023-10-01T12:00:00Z',
    required: false,
  })
  startedAt?: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty({
    description: 'Date de fin de la session',
    example: '2023-10-01T12:30:00Z',
    required: false,
  })
  finishedAt?: Date | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({
    description: 'Liste des réponses fournies par l’utilisateur',
    type: () => [SessionAnswerDto],
    example: [
      { correct: true, a: 'Réponse A' },
      { correct: false, a: 'Réponse B' },
    ],
    required: false,
  })
  answers?: SessionAnswerDto[];
}