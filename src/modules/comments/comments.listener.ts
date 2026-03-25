import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommentEvents } from './comments.events';
import type { CommentCreatedPayload } from './interfaces/comments.interfaces';
import { CommentsSocketGateway } from './comments.gateway';
import type ImageCompleted from 'src/infrastructure/queue/bullMQ/interfaces/image.completed';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class CommentsListener {
  constructor(
    private readonly commentOutput: CommentsSocketGateway,
    private readonly cacheService: CacheService,
  ) {}

  @OnEvent(CommentEvents.CREATED)
  async handleNewComment(payload: CommentCreatedPayload) {
    this.commentOutput.sendNewComment(payload.comment);
    await this.cacheService.clearCommentsFirstPage();
  }

  @OnEvent(CommentEvents.FILE_PROCESSED)
  async handleFileProcessed(payload: ImageCompleted) {
    this.commentOutput.sendFileReady(payload.fileId, payload.isLoaded);
  }
  @OnEvent(CommentEvents.DELETED)
  async handleCommentDelete(response: any) {
    this.commentOutput.sendCommentDelete(response);
    await this.cacheService.clearCommentsFirstPage();
  }
}
