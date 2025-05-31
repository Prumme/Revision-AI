import { ApiProperty } from '@nestjs/swagger';
import { Question } from '@common/types/question';
import { Answer } from '@common/types/answer';

export class Quiz {
  @ApiProperty({ description: 'ID du quiz' })
  id: string;

  @ApiProperty({ description: "ID de l'utilisateur" })
  userId: string;

  @ApiProperty({ description: 'Nom du quiz' })
  name: string;

  @ApiProperty({ description: 'Description du quiz' })
  description: string;

  @ApiProperty({ description: 'Questions du quiz', type: [Question] })
  questions: Question[];

  @ApiProperty({ description: 'Tags du quiz' })
  tags: string[];

  @ApiProperty({ description: 'Score de rigueur' })
  rigorScore: number;

  @ApiProperty({ description: 'Visibilité publique' })
  public: boolean;

  @ApiProperty({ description: 'Réponses au quiz', type: [Answer] })
  answers: Answer[];

  @ApiProperty({ description: 'Contexte du quiz' })
  context: string;

  @ApiProperty({ description: 'Liste des likes' })
  likes: string[];

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: Date;
}
