import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { MulterError } from 'multer';
import * as fs from 'fs/promises';
import { FileUploadException } from '../exceptions/file-upload.exception';

@Catch(PayloadTooLargeException, FileUploadException)
export class MulterExceptionFilter implements ExceptionFilter {
  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let message = exception.message;

    if (exception instanceof PayloadTooLargeException) {
      message = 'Максимальный размер файла 2Мб';
    }
    if (exception instanceof FileUploadException) {
      message = exception.message;
    }

    const file = request.file;
    if (file && file.path) {
      await fs.unlink(file.path).catch(() => null);
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: message,
      error: 'File Upload Error',
    });
  }
}
