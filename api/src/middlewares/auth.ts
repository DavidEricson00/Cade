import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      code: 401,
      message: 'Token não informado',
    });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string, {
      algorithms: ['HS256'],
    });

    if (typeof payload === 'string' || 'purpose' in payload || !payload.sub) {
      throw new Error('Token não permitido');
    }

    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({
      success: false,
      code: 401,
      message: 'Token inválido ou expirado',
    });
  }
}