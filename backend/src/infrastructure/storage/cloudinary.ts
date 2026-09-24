import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { config } from '../../config/env';
import { ConfigurationError } from '../../shared/errors/AppError';

let isConfigured = false;

/**
 * Configure and return Cloudinary v2 instance
 */
export function getCloudinary() {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ConfigurationError(
      'Cloudinary is not configured. Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.',
    );
  }

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    isConfigured = true;
  }

  return cloudinary;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

/**
 * Upload an in-memory file buffer directly to Cloudinary.
 *
 * @param buffer In-memory file buffer from multer.memoryStorage
 * @param folder Subfolder name under miniflicks (e.g. 'cakes', 'screens', 'banners')
 * @param filenameHint Optional original filename to use as public_id base
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  filenameHint?: string,
): Promise<CloudinaryUploadResult> {
  const cld = getCloudinary();
  const targetFolder = `miniflicks/${folder.replace(/^\/+|\/+$/g, '')}`;

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadOptions: Record<string, any> = {
      folder: targetFolder,
      resource_type: 'image',
    };

    if (filenameHint) {
      const cleanName = filenameHint
        .replace(/\.[^/.]+$/, '') // strip extension
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      uploadOptions.public_id = `${Date.now()}-${cleanName}`;
    }

    const uploadStream = cld.uploader.upload_stream(
      uploadOptions,
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned no result'));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      },
    );

    // Pipe the buffer into Cloudinary upload stream
    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Upload a local file path to Cloudinary (used by migration script)
 */
export async function uploadLocalFileToCloudinary(
  localFilePath: string,
  folder: string,
): Promise<CloudinaryUploadResult> {
  const cld = getCloudinary();
  const targetFolder = `miniflicks/${folder.replace(/^\/+|\/+$/g, '')}`;

  const result = await cld.uploader.upload(localFilePath, {
    folder: targetFolder,
    resource_type: 'image',
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
  };
}

/**
 * Delete an asset from Cloudinary by its public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<any> {
  const cld = getCloudinary();
  return await cld.uploader.destroy(publicId);
}
