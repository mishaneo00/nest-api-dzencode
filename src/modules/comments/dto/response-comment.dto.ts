export class CommentResponseDto {
  id: number;
  username: string;
  email: string;
  homepage?: string;
  text: string;
  createdAt: string;
  parentId?: number;
  fingerprint?: string;
  file?: {
    id: number;
    filename: string;
    originalName: string;
    isLoaded: boolean;
    mimetype: string;
  };
  replies?: CommentResponseDto[];
}
