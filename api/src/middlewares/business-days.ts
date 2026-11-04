import type { Request, Response, NextFunction } from 'express';

export function businessDays(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const day = new Date().getDay();

  if (day === 0 || day === 6) {
    res.status(403).json({
      success: false,
      code: 403,
      message: 'A API não está disponível aos finais de semana',
    });

    return;
  }

  next();
}