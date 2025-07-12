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

  /**
   * Informations relatives au secret TOTP de l'utilisateur pour l'authentification à deux facteurs.
   *
   * @property secret - La clé secrète utilisée pour générer les codes TOTP.
   * @property otpauth_url - L'URL otpauth compatible avec les applications d'authentification.
   * @property userId - L'identifiant de l'utilisateur associé à ce secret TOTP.
   */
  @ApiProperty({
    description: "Informations relatives au secret TOTP de l'utilisateur pour l'authentification à deux facteurs.",
    example: false,
    required: false,
  })
  @IsOptional()
  TOTPSecret?: {
    secret: string;
    otpauth_url: string;
    userId: string;
    active: boolean;
  };
}
