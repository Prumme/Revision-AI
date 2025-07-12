import { Public } from '@common/decorators/public.decorator';
import { ReqUser } from '@common/types/request';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as qrcode from 'qrcode';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Retourne le token JWT',
  })
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.email, loginDto.password,loginDto?.totpCode);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur' })
  @ApiResponse({
    status: 200,
    description: "Retourne l'utilisateur",
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  @ApiOperation({ summary: "Vérifier l'email utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Email vérifié avec succès',
  })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Récupérer les informations de l'utilisateur connecté",
  })
  @ApiResponse({
    status: 200,
    description: "Retourne les informations de l'utilisateur connecté",
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async getCurrentUser(@Req() req: Request & { user: ReqUser }) {
    return this.authService.getCurrentUser(req.user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Déconnexion utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Déconnexion réussie',
  })
  logout() {
    return this.authService.logout();
  }


  @Post('totp/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activer le TOTP' })
  @ApiResponse({
    status: 200,
    description: 'TOTP activé avec succès',
    schema: {
      type: 'object',
      properties: {
        qrCode: { type: 'string' },
      },
    },
  })
  async enableTOTP(@Req() req: Request & { user: ReqUser }) {
    const user = await this.authService.toogleTOTP(req.user, true) as { TOTPSecret: { otpauth_url: string } };
    const qrCode = await qrcode.toDataURL(user.TOTPSecret.otpauth_url);
    return { qrCode };
  }

  @Post('totp/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Désactiver le TOTP' })
  @ApiResponse({
    status: 200,
    description: 'TOTP désactivé avec succès',
  })
  async disableTOTP(@Req() req: Request & { user: ReqUser }) : Promise<{ message: string }> {
    await this.authService.toogleTOTP(req.user, false);
    return { message: 'TOTP désactivé avec succès' };
  }
}
