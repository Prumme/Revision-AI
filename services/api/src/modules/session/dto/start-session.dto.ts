import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StartSessionDto {
  @ApiProperty({ description: 'ID de la session à reprendre', example: '1234567890abcdef' })
  @IsString()
  sessionId: string;
}
