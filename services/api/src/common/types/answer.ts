import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsDate } from 'class-validator';

export class Answer {
  @ApiProperty({ description: "ID de l'utilisateur" })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Réponses sélectionnées' })
  @IsArray()
  @IsString({ each: true })
  selectedAnswers: string[];

  @ApiProperty({ description: 'Date de la réponse' })
  @IsDate()
  answeredAt: Date;
}
