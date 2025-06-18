import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: "Ancien mot de passe de l'utilisateur",
    example: '********',
    required: false,
  })
  @IsString()
  @IsOptional()
  oldPassword?: string;

  @ApiProperty({
    description: "Nouveau mot de passe de l'utilisateur",
    example: '********',
    required: false,
  })
  @IsString()
  @IsOptional()
  newPassword?: string;
}
