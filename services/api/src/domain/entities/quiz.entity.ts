import { Question } from '@common/types/question';
import { ApiProperty } from '@nestjs/swagger';

export class Quiz {
  id: string;

  @ApiProperty({ description: "ID de l'utilisateur" })
  userId: string;

  @ApiProperty({ description: 'Titre du quiz' })
  title: string;

  @ApiProperty({ description: 'Catégorie du quiz' })
  category: string;

  @ApiProperty({ description: 'Questions du quiz', type: [Question] })
  questions: Question[];

  @ApiProperty({ description: 'Nombre de questions' })
  questionsNumbers: number;

  @ApiProperty({ description: 'Description du quiz' })
  description: string;

  @ApiProperty({ description: 'Visibilité publique' })
  isPublic: boolean;

  @ApiProperty({ description: 'Médias associés au quiz', type: [String] })
  media: string[];

  @ApiProperty({
    description: 'Statut du quiz',
    enum: ['pending', 'processing', 'completed', 'failed'],
  })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: Date;
}
