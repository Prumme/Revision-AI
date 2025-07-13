import { Question } from '@common/types/question';
import { ApiProperty } from '@nestjs/swagger';
import { UploadedDocument } from '@entities/document.entity';

export class Quiz {
  id: string;

  @ApiProperty({ description: "ID de l'utilisateur" })
  userId: string;

  @ApiProperty({ description: "Nom d'utilisateur" })
  username: string;

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

  @ApiProperty({
    description: 'Médias associés au quiz',
    type: Array<UploadedDocument>,
  })
  media: UploadedDocument[];

  // @ApiProperty({
  //   description: 'Statut du quiz',
  //   enum: ['pending', 'processing', 'completed', 'failed'],
  // })
  // status: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: Date;
}

export function createQuiz(
  title: string,
  description: string,
  category: string,
  questionsNumbers: number,
  isPublic: boolean,
  userId: string,
  username: string,
  media: UploadedDocument[] = [],
): Quiz {
  return {
    id: '',
    userId,
    username,
    title,
    category,
    questions: [],
    questionsNumbers,
    description,
    isPublic,
    media,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function putQuestions(quiz: Quiz, questions: Question[]): Quiz {
  return {
    ...quiz,
    questions: questions.map((q) => ({
      ...q,
      answers: (q.answers || []).map((a) => {
        let cValue = a.c;
        if (typeof a.c === 'boolean') cValue = a.c;
        return {
          ...a,
          c: typeof cValue === 'boolean' ? cValue : false,
        };
      }),
    })),
    updatedAt: new Date(),
  };
}
