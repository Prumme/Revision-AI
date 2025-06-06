import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Nom d'utilisateur de l'utilisateur",
    example: 'John',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: "Mot de passe de l'utilisateur",
    example: 'password123',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
