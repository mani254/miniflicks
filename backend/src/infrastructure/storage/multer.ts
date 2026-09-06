import multer, { type StorageEngine, type FileFilterCallback } from 'multer';
import type { Request, RequestHandler } from 'express';
import path from 'path';
import fs from 'fs';
import { config } from '../../config/env';
import { ValidationError } from '../../shared/errors/AppError';

export interface FileUploadOptions {
  storagePath: string;
  fieldName: string;
  single?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
}

/**
 * Creates a strongly-typed Multer upload middleware.
 * Ensures the destination directory exists and validates file size and MIME type.
 */
export function createFileUploadMiddleware(options: FileUploadOptions): RequestHandler {
  const {
    storagePath,
    fieldName,
    single = true,
    maxSize = config.upload.maxFileSizeBytes,
    allowedTypes = config.upload.allowedMimeTypes as unknown as string[],
  } = options;

  // Ensure storage directory exists
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  const storage: StorageEngine = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
      cb(null, storagePath);
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
      const ext = path.extname(file.originalname);
      const safeBasename = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${safeBasename}${ext}`);
    },
  });

  const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ): void => {
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      return cb(
        new ValidationError(
          `Invalid file type "${file.mimetype}". Allowed types are: ${allowedTypes.join(', ')}`,
        ),
      );
    }
    cb(null, true);
  };

  const upload = multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter,
  });

  return single ? upload.single(fieldName) : upload.array(fieldName);
}
