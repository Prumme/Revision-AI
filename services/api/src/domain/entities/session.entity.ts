import { ApiProperty } from '@nestjs/swagger';

export class Session {
  id: string;

  @ApiProperty({ description: 'ID du quiz associé' })
  quizId: string;

  @ApiProperty({ description: "ID de l'utilisateur", required: false })
  userId?: string;

  @ApiProperty({ description: 'Score obtenu' })
  score: number;

  @ApiProperty({ description: 'Date de début de la session' })
  startedAt: Date;

  @ApiProperty({ description: 'Date de fin de la session', required: false })
  finishedAt?: Date;

  @ApiProperty({ description: 'Réponses fournies par l’utilisateur', type: [Object] })
  answers: { correct: boolean; a: string }[];
}