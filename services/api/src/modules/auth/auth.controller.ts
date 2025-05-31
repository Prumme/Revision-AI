import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Retourne le token JWT',
  })
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.email, loginDto.password);
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
}
