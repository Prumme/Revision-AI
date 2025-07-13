import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
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

  @ApiProperty({
    description: 'Durée de la session en secondes',
    required: false,
  })
  duration?: number;

  @ApiProperty({ description: 'Date de début de la session' })
  startedAt: Date;

  @ApiProperty({ description: 'Date de fin de la session', required: false })
  finishedAt?: Date;

  @ApiProperty({
    description: 'Réponses fournies par l’utilisateur',
    type: [Object],
  })
  answers: SessionAnswer[];

  @ApiProperty({
    description: 'Statut de la session',
    enum: SessionStatus,
    default: SessionStatus.PENDING,
  })
  status: SessionStatus;
}

export function startSession(quizId: string, userId?: string): Session {
  return {
    id: uuidv4(),
    quizId,
    userId,
    startedAt: new Date(),
    finishedAt: null,
    score: 0,
    duration: 0,
    answers: [],
    status: SessionStatus.ACTIVE,
  };
}
export function resumeSession(Session: Session): Session {
  return {
    ...Session,
    status: SessionStatus.ACTIVE,
    finishedAt: undefined,
    duration: undefined,
  };
}

export function pauseSession(Session: Session): Session {
  return {
    ...Session,
    status: SessionStatus.PAUSED,
  };
}

export function addAnswer(Session: Session, answer: SessionAnswer): Session {
  return {
    ...Session,
    answers: [...Session.answers, answer],
  };
}

export function putAnswers(
  Session: Session,
  answers: SessionAnswer[],
): Session {
  return {
    ...Session,
    answers,
  };
}

export function putScore(Session: Session, score: number): Session {
  return {
    ...Session,
    score,
  };
}

export function endSession(session: Session): Session {
  return {
    ...session,
    status: SessionStatus.FINISHED,
    finishedAt: new Date(),
    duration: session.startedAt
      ? Math.round((Date.now() - session.startedAt.getTime()) / 1000)
      : undefined,
  };
}
