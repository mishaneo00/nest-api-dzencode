import { diskStorage } from 'multer';
import path from 'path';
import { FileUploadException } from 'src/common/exceptions/file-upload.exception';
import * as uuid from 'uuid';

export const multerOptions = {
  storage: diskStorage({
    destination: './temp',
    filename: (req, file, cb) => {
      const fileName = `${uuid.v4()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /^(image\/(jpeg|png|gif)|text\/plain)$/;

    if (allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new FileUploadException('Разрешены только файлы JPG, PNG, GIF и TXT'),
        false,
      );
    }
  },
};
