import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          db: config.get<number>('REDIS_DB_BULL'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'image-processing',
      processors: [
        {
          name: 'image-resize',
          path: path.join(__dirname, 'workers/image.worker.js'),
          concurrency: 2,
        },
      ],
    }),
  ],
  exports: [BullModule],
})
export class BullQueueModule {}
