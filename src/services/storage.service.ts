import type { UploadApiResponse } from 'cloudinary';
import cloudinary, {
  CLOUDINARY_FOLDER,
  isCloudinaryConfigured,
} from '../config/cloudinary';

export type UploadedImage = {
  url: string;
  publicId: string;
};

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('Armazenamento de imagens em nuvem não está configurado');
    this.name = 'StorageNotConfiguredError';
  }
}

/**
 * Envia a imagem (em memória) direto para o Cloudinary via stream.
 * Nada é gravado em disco, o que é necessário em ambientes serverless (Vercel).
 */
export function uploadImage(buffer: Buffer): Promise<UploadedImage> {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(new StorageNotConfiguredError());
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(error ?? new Error('Falha no upload da imagem'));
        }

        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    stream.end(buffer);
  });
}

/**
 * Remove a imagem do Cloudinary. Falhas são apenas registradas para não
 * impedir a remoção do item no banco.
 */
export async function deleteImage(publicId?: string): Promise<void> {
  if (!publicId || !isCloudinaryConfigured()) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (error) {
    console.error('ERRO AO REMOVER IMAGEM DA NUVEM:', error);
  }
}
