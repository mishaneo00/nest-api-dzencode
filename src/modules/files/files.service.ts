import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FileType } from './files.types';
import { EntityManager } from 'typeorm';
import { FileEntity } from './entity/file.entity';

export type UploadResult = {
  type: FileType;
  isLoaded: boolean;
};

const FOLDER_MAP: Record<string, string> = {
  image: 'images',
  text: 'docs',
};

@Injectable()
export class FilesService {
  async processAndSave(file: Express.Multer.File): Promise<UploadResult> {
    const isImage = file.mimetype.startsWith('image/');
    const isDocument = file.mimetype === 'text/plain';

    const type = isImage ? FileType.IMAGE : FileType.DOCUMENT;

    if (isDocument) {
      await this.moveFileToPermanentStorage(file);
      return { isLoaded: true, type };
    }

    return { isLoaded: false, type };
  }

  async downloadFile(filename: string, mimetype: string) {
    const folderPath = await this.getFolderPath(mimetype);

    const filePath = path.join(process.cwd(), folderPath, filename);

    try {
      await fs.stat(filePath);
    } catch (error) {
      throw new NotFoundException('Файл не найден на сервере');
    }

    return { filePath };
  }

  async saveFileEntity(
    file: Express.Multer.File,
    isLoaded: boolean,
    manager: EntityManager,
  ): Promise<FileEntity> {
    const fileEntity = manager.create(FileEntity, {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      isLoaded: isLoaded,
    });
    return await manager.save(fileEntity);
  }

  async removeEntity(file: FileEntity, manager: EntityManager) {
    return await manager.delete(FileEntity, file.id);
  }

  async removeLocalFile(file: FileEntity): Promise<void> {
    let filePath: string;
    if (file.isLoaded) {
      const folderPath = await this.getFolderPath(file.mimetype);
      filePath = path.join(folderPath, file.filename);
    } else {
      filePath = path.join('temp', file.filename);
    }

    await fs.unlink(filePath).catch(() => {});
  }

  private async moveFileToPermanentStorage(
    file: Express.Multer.File,
  ): Promise<void> {
    const folderPath = await this.getFolderPath(file.mimetype);
    await fs.mkdir(folderPath, { recursive: true });

    const finalPath = path.join(folderPath, file.filename);
    await fs.rename(file.path, finalPath);
  }

  private async getFolderPath(mimetype: string): Promise<string> {
    const type = mimetype.split('/')[0];
    const subFolder = FOLDER_MAP[type];
    return `uploads/${subFolder}`;
  }
}
