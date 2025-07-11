import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class EndSessionAnswerDto {
  @ApiProperty({ description: 'La réponse choisie', example: 'Réponse A' })
  a: string;

  @ApiProperty({ description: 'La réponse est-elle correcte ?', example: true })
  correct: boolean;
}

export class EndSessionDto {
  @ApiProperty({ description: 'ID de la session à terminer', example: '1234567890abcdef' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Score obtenu', example: 7 })
  @IsNumber()
  score: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EndSessionAnswerDto)
  answers: EndSessionAnswerDto[];
}
