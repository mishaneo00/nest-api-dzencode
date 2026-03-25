import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesListener } from './files.listener';
import { BullQueueModule } from 'src/infrastructure/queue/bullMQ/bull.module';
import { FilesController } from './files.controller';

@Module({
  providers: [FilesService, FilesListener],
  imports: [BullQueueModule],
  exports: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
