import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { CommentEvents } from '../comments/comments.events';
import type { CommentCreatedPayload } from '../comments/interfaces/comments.interfaces';
import { FileType } from './files.types';

@Injectable()
export class FilesListener {
  constructor(
    @InjectQueue('image-processing') private readonly imageQueue: Queue,
  ) {}

  @OnEvent(CommentEvents.CREATED)
  async handleFileUploaded(payload: CommentCreatedPayload) {
    try {
      if (!payload.file) return;

      if (payload.file.type === FileType.IMAGE) {
        await this.imageQueue.add(
          'image-resize',
          {
            fileId: payload.file.fileId,
            filename: payload.file.filename,
          },
          {
            removeOnComplete: true,
            attempts: 3,
          },
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
}
