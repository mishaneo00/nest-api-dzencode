import { Job } from 'bullmq';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import ImageCompleted from '../interfaces/image.completed';

module.exports = async (job: Job) => {
  const { fileId, filename } = job.data;

  const tempPath = path.join(process.cwd(), 'temp', filename);
  const uploadsPath = path.join(process.cwd(), 'uploads/images', filename);

  await fs.mkdir(path.dirname(uploadsPath), { recursive: true });

  try {
    await sharp(tempPath)
      .resize(320, 240, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(uploadsPath);

    const response: ImageCompleted = { fileId: fileId, isLoaded: true };

    return response;
  } catch (error) {
    console.log(error);
  } finally {
    await fs.unlink(tempPath);
  }
};
