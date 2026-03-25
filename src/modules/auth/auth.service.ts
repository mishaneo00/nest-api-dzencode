import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as uuid from 'uuid';
import * as svgCaptcha from 'svg-captcha';
import { TokenResponseDto } from './dto/token-response.dto';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) {}

  async generateSessionToken(): Promise<TokenResponseDto> {
    const uniqueId = uuid.v4();

    const payload = {
      sub: uniqueId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async generateCaptcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 2,
      color: true,
      background: '#ffffff',
    });

    const captchaKey = uuid.v4();

    await this.cacheService.setCaptcha(captchaKey, captcha.text);

    return {
      captchaKey,
      svg: captcha.data,
    };
  }
}
