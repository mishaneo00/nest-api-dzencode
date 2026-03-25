import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache/cache.service';
import { CaptchaGuard } from './guards/captcha.guard';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = config.get<number>('REDIS_PORT', 6379);
        const db = config.get<number>('REDIS_DB', 2);

        return {
          stores: [
            new Keyv({
              store: new KeyvRedis(`redis://${host}:${port}/${db}`),
            }),
          ],
        };
      },
    }),
  ],
  providers: [CacheService, CaptchaGuard],
  exports: [CacheService, CaptchaGuard],
})
export class CommonModule {}
