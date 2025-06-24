import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';

export class Answer {
  @ApiProperty({
    description: 'Texte de la réponse',
    example: 'En 1638',
  })
  @IsString()
  a: string;

  @ApiProperty({
    description: 'Indique si cette réponse est la bonne',
    example: true,
  })
  @IsBoolean()
  c: boolean;
}

export class Question {
  @ApiProperty({
    description: 'Texte de la question',
    example: 'Quand est né Louis XIV?',
  })
  @IsString()
  q: string;

  @ApiProperty({
    description: 'Liste des réponses possibles',
    type: [Answer],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Answer)
  answers: Answer[];
}
