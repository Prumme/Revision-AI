import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Choice {
  @ApiProperty({ description: 'Libellé du choix' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Indique si le choix est correct' })
  correct: boolean;
}

export class Question {
  @ApiProperty({ description: 'Libellé de la question' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Choix possibles', type: [Choice] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Choice)
  choices: Choice[];
}
