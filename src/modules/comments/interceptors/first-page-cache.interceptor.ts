import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';

@Injectable()
export class FirstPageCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    protected readonly reflector: Reflector,
  ) {
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { cursor, limit } = request.query;

    if (cursor) {
      return undefined;
    }

    const currentLimit = limit || 25;
    const cacheKey = `comments.first_page.limit.${currentLimit}`;

    return cacheKey;
  }
}
