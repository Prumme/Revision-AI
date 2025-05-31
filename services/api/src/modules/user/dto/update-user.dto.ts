import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'john.doe@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: "Prénom de l'utilisateur",
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstname?: string;

  @ApiProperty({
    description: "Nom de l'utilisateur",
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastname?: string;
}
