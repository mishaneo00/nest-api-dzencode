import { CommentResponseDto } from '../dto/response-comment.dto';
import { CommentEntity } from '../entity/comment.entity';

export class CommentMapper {
  static toDto(comment: CommentEntity): CommentResponseDto {
    const isDeleted = !!comment.deletedAt;

    return {
      id: comment.id,
      username: isDeleted ? 'Удаленный комментарий' : comment.author?.username,
      email: isDeleted ? '' : comment.author?.email,
      homepage: isDeleted ? undefined : (comment.author?.homepage ?? undefined),
      text: isDeleted ? '<em>Сообщение удалено</em>' : comment.text,
      createdAt: comment.createdAt.toISOString(),
      parentId: comment.parentId ?? undefined,
      fingerprint: isDeleted ? undefined : (comment.fingerprint ?? undefined),
      file: isDeleted
        ? undefined
        : comment.file
          ? {
              id: comment.file.id,
              filename: comment.file.filename,
              originalName: comment.file.originalName,
              isLoaded: comment.file.isLoaded,
              mimetype: comment.file.mimetype,
            }
          : undefined,
      replies: comment.replies?.map((reply) => this.toDto(reply)) || [],
    };
  }
}
