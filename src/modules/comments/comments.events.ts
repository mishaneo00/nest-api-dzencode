export const CommentEvents = {
  CREATED: 'comment.created',
  FILE_PROCESSED: 'comment.file_processed',
  DELETED: 'comment.deleted',
} as const;

export const CommentWsEvents = {
  CREATED: 'comment:created',
  FILE_READY: 'comment:file_ready',
  DELETED: 'comment:deleted',
} as const;
