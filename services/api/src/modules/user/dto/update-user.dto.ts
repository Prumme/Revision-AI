import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';

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
    description: "Nom d'utilisateur de l'utilisateur",
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: "Statut de blocage de l'utilisateur",
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  blocked?: boolean;
}
