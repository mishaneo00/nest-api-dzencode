import { OnQueueCompleted, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import type ImageCompleted from 'src/infrastructure/queue/bullMQ/interfaces/image.completed';
import { CommentEvents } from 'src/modules/comments/comments.events';
import { FileEntity } from 'src/modules/files/entity/file.entity';
import { Repository } from 'typeorm';

@Processor('image-processing')
export class ImageQueueListener {
  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  @OnQueueCompleted()
  async handleCompleted(job: Job, result: ImageCompleted) {
    await this.filesRepository.update(result.fileId, {
      isLoaded: true,
    });

    this.eventEmitter.emit(CommentEvents.FILE_PROCESSED, result);
  }
}
