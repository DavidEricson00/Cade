import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { requestLogs } from '../data/request-logs.js';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timezone = req.headers['x-timezone'] as string | undefined;

  const log = {
    id: crypto.randomUUID(),
    method: req.method,
    route: req.originalUrl,
    timestamp: new Date().toISOString(),
    timezone,
  };

  requestLogs.push(log);

  console.log('LOG REGISTRADO:', log);

  next();
}