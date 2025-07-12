import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
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
    description: 'Code TOTP pour l\'authentification à deux facteurs (facultatif)',
    example: '123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  totpCode?: string; // Optional TOTP code for two-factor authentication
}
