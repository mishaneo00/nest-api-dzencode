import { FileType } from 'src/modules/files/files.types';
import { CommentResponseDto } from '../dto/response-comment.dto';
import { CommentEntity } from '../entity/comment.entity';

export interface CommentWithReplies extends CommentEntity {
  replies: CommentWithReplies[];
}

export interface CommentCreatedPayload {
  comment: CommentResponseDto;
  file?: {
    fileId: number;
    filename: string;
    type: FileType;
  };
}
