import { Controller, Get, Header, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenResponseDto } from './dto/token-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('session')
  async createAnonymousSession(): Promise<TokenResponseDto> {
    return await this.authService.generateSessionToken();
  }

  @Post('captcha')
  @Header('Cache-Control', 'no-store')
  async getCaptcha() {
    return await this.authService.generateCaptcha();
  }
}
