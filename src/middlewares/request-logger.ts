import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { requestLogs } from '../data/request-logs.js';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const log = {
    id: crypto.randomUUID(),
    method: req.method,
    route: req.originalUrl,
    timestamp: new Date().toISOString(),
  };

  requestLogs.push(log);

  console.log('LOG REGISTRADO:', log);

  next();
}