import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { type Request } from 'express';

/**
 * Creates a multer upload middleware that saves files to public/uploads/<folder>
 * and returns only the relative path e.g. /uploads/banners/filename.jpg
 */
export function createUploader(folder: string) {
  const dest = path.join(process.cwd(), 'public', 'uploads', folder);

  // Ensure directory exists
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req: Request, _file, cb) => {
      cb(null, dest);
    },
    filename: (_req: Request, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      cb(null, unique);
    },
  });

  const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png, webp, gif)'));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  });
}

/**
 * Given a multer file, return the relative URL path to store in DB.
 * e.g.  /uploads/banners/1234567890-123456.jpg
 */
export function getRelativeFilePath(folder: string, filename: string): string {
  return `/uploads/${folder}/${filename}`;
}
