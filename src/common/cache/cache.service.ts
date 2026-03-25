import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService implements OnModuleInit {
  private client: any;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async onModuleInit() {
    this.client = this.getclient();

    if (!this.client) {
      console.error('[Cache] Не удалось инициализировать Cache клиент!');
      return;
    }

    if (!this.client.isOpen) {
      await this.client.connect().catch((err) => {
        console.error('[Cache] Ошибка первичного подключения:', err.message);
      });
    }
  }

  private getclient() {
    const manager = this.cacheManager as any;
    const keyvInstance = manager.stores ? manager.stores[0] : null;
    return keyvInstance?.store?.client || null;
  }

  private async getAliveClient() {
    if (!this.client) throw new Error('Client not initialized');

    if (!this.client.isOpen) {
      await this.client.connect();
    }
    return this.client;
  }

  async setCaptcha(captchaKey: string, value: string): Promise<void> {
    const client = await this.getAliveClient();

    const key = `captcha:${captchaKey}`;

    return await client.set(key, value, {
      EX: 300,
    });
  }

  async getCaptcha(captchaKey: string): Promise<string | null> {
    const client = await this.getAliveClient();

    const key = `captcha:${captchaKey}`;
    return await client.get(key);
  }

  async deleteCaptcha(captchaKey: string): Promise<void> {
    const client = await this.getAliveClient();

    const key = `captcha:${captchaKey}`;
    return await client.del(key);
  }

  async clearCommentsFirstPage(): Promise<void> {
    try {
      const client = await this.getAliveClient();

      const pattern = 'keyv:comments.first_page.limit.*';

      let keys = await client.keys(`keyv::${pattern}`);

      if (!keys || keys.length === 0) {
        keys = await client.keys(`${pattern}`);
      }

      if (keys && keys.length > 0) {
        await Promise.all(keys.map((key) => client.del(key)));
        console.log(`[Cache] Очищено ключей: ${keys.length}`);
      }
    } catch (error) {
      console.error('[Cache] Ошибка при очистке кэша комментариев:', error);
    }
  }
}
