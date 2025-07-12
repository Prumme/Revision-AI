import { ApiProperty } from '@nestjs/swagger';

export enum SessionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

export interface SessionAnswer {
  c: boolean;
  a: string;
}

export class Session {
  id: string;

  @ApiProperty({ description: 'ID du quiz associé' })
  quizId: string;

  @ApiProperty({ description: "ID de l'utilisateur", required: false })
  userId?: string;

  @ApiProperty({ description: 'Score obtenu' })
  score: number;

  @ApiProperty({ description: 'Durée de la session en secondes', required: false })
  duration?: number;

  @ApiProperty({ description: 'Date de début de la session' })
  startedAt: Date;

  @ApiProperty({ description: 'Date de fin de la session', required: false })
  finishedAt?: Date;

  @ApiProperty({ description: 'Réponses fournies par l’utilisateur', type: [Object] })
  answers: SessionAnswer[];

  @ApiProperty({ description: 'Statut de la session', enum: SessionStatus, default: SessionStatus.PENDING })
  status: SessionStatus;
}