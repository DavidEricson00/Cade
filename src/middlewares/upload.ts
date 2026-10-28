import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const MAX_IMAGE_SIZE_MB = 5;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname),
      );
    }
    cb(null, true);
  },
});

const MULTER_MESSAGES: Partial<Record<multer.ErrorCode, string>> = {
  LIMIT_FILE_SIZE: `A imagem deve ter no máximo ${MAX_IMAGE_SIZE_MB}MB`,
  LIMIT_FILE_COUNT: 'Envie apenas uma imagem',
  LIMIT_UNEXPECTED_FILE: `Envie um único arquivo de imagem (${ALLOWED_MIME_TYPES.join(', ')}) no campo "image"`,
};

/**
 * Aceita um único arquivo opcional no campo "image" (multipart/form-data)
 * e devolve 400 padronizado em caso de arquivo inválido.
 */
export function uploadImage(req: Request, res: Response, next: NextFunction) {
  upload.single('image')(req, res, (error: unknown) => {
    if (!error) return next();

    const message =
      error instanceof multer.MulterError
        ? (MULTER_MESSAGES[error.code] ?? error.message)
        : 'Erro ao processar o upload';

    res.status(400).json({ success: false, code: 400, message });
  });
}
