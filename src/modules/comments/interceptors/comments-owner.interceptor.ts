import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class CommentsAuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    const userFingerprint = request.user?.fingerprint;

    return next.handle().pipe(
      map((data) => {
        const mapRecursive = (comment: any) => {
          const { fingerprint, replies, ...rest } = comment;

          return {
            ...rest,
            itsMy: fingerprint === userFingerprint,
            replies: Array.isArray(replies)
              ? replies.map((reply) => mapRecursive(reply))
              : [],
          };
        };
        if (Array.isArray(data)) {
          return data.map((comment) => mapRecursive(comment));
        }

        return data;
      }),
    );
  }
}
