import { PipeTransform, Injectable } from '@nestjs/common';
import { fileTypeFromFile } from 'file-type';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FileUploadException } from '../exceptions/file-upload.exception';

@Injectable()
export class FileSignaturePipe implements PipeTransform {
  async transform(file: Express.Multer.File) {
    if (!file) return undefined;

    const allowedImageExtensions = ['.jpg', '.jpeg', '.gif', '.png'];
    const allowedImageMimes = ['image/jpeg', 'image/gif', 'image/png'];
    const maxTextFileSize = 100 * 1024;

    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    const filePath = file.path;
    const fileExt = path.extname(file.originalname).toLowerCase();

    const type = await fileTypeFromFile(filePath);

    if (allowedImageExtensions.includes(fileExt)) {
      if (!type || !allowedImageMimes.includes(type.mime)) {
        throw new FileUploadException('Несоответствие типа контента');
      }
    } else if (fileExt === '.txt') {
      if (type) {
        throw new FileUploadException(
          `Несоответствие типа контента (обнаружен тип: ${type.mime})`,
        );
      }

      if (file.size > maxTextFileSize) {
        throw new FileUploadException(
          'Текстовый файл слишком большой (макс. 100КБ)',
        );
      }

      const buffer = await fs.readFile(filePath);
      if (buffer.includes(0)) {
        throw new FileUploadException(
          'Текстовый файл содержит недопустимые бинарные данные',
        );
      }
    } else {
      throw new FileUploadException('Неподдерживаемый формат файла');
    }

    return file;
  }
}
