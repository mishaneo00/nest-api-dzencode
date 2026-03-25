import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { FileEntity } from '../files/entity/file.entity';
import { CommentEntity } from './entity/comment.entity';
import { CommentsController } from './comments.controller';
import { CommentsSocketGateway } from './comments.gateway';
import { CommentsListener } from './comments.listener';
import { ImageQueueListener } from '../files/processors/image.processor';
import { FilesModule } from '../files/files.module';
import { BullQueueModule } from 'src/infrastructure/queue/bullMQ/bull.module';
import { CacheService } from 'src/common/cache/cache.service';
import { CaptchaGuard } from '../../common/guards/captcha.guard';

@Module({
  providers: [
    CommentsService,
    ImageQueueListener,
    CommentsListener,
    CommentsSocketGateway,
    CacheService,
    CaptchaGuard,
  ],
  controllers: [CommentsController],
  imports: [
    BullQueueModule,
    TypeOrmModule.forFeature([UserEntity, FileEntity, CommentEntity]),
    FilesModule,
  ],
})
export class CommentsModule {}
