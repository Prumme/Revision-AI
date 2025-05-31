import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: "L'adresse email de l'utilisateur",
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Le mot de passe de l'utilisateur",
    example: 'motDePasse123!',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "Le prénom de l'utilisateur",
    example: 'Jean',
  })
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({
    description: "Le nom de l'utilisateur",
    example: 'Dupont',
  })
  @IsString()
  @IsNotEmpty()
  lastname: string;
}
