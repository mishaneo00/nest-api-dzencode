import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private readonly cacheService: CacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-captcha-key'];
    const value = request.headers['x-captcha-value'];

    if (!key || !value) {
      throw new BadRequestException('Отсутствуют данные капчи');
    }

    const storedValue = await this.cacheService.getCaptcha(key);

    if (!storedValue || storedValue.toLowerCase() !== value.toLowerCase()) {
      throw new BadRequestException('Неверная или просроченная капча');
    }

    await this.cacheService.deleteCaptcha(key);

    return true;
  }
}
