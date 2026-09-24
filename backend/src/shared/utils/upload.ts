import multer from 'multer';
import path from 'path';
import { type Request } from 'express';
import { uploadBufferToCloudinary } from '../../infrastructure/storage/cloudinary';

/**
 * Creates an in-memory multer upload middleware.
 * Files are kept in RAM buffer for direct streaming to Cloudinary.
 */
export function createUploader(_folder?: string) {
  const storage = multer.memoryStorage();

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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  });
}

/**
 * Upload a single multer in-memory file to Cloudinary and return its HTTPS URL.
 */
export async function uploadFileToCloudinary(
  file: Express.Multer.File,
  folder: string,
): Promise<string> {
  const result = await uploadBufferToCloudinary(file.buffer, folder, file.originalname);
  return result.secure_url;
}

/**
 * Upload multiple multer in-memory files to Cloudinary concurrently and return an array of HTTPS URLs.
 */
export async function uploadFilesToCloudinary(
  files: Express.Multer.File[],
  folder: string,
): Promise<string[]> {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map((file) => uploadFileToCloudinary(file, folder));
  return await Promise.all(uploadPromises);
}

/**
 * Legacy helper for backwards compatibility.
 * Given a folder and filename, returns relative path e.g. /uploads/banners/123.jpg
 */
export function getRelativeFilePath(folder: string, filename: string): string {
  return `/uploads/${folder}/${filename}`;
}
