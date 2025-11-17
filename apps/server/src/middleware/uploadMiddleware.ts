import multer from 'multer';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
    cb(new AppError('Only JPEG or PNG images are supported', 400));
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
