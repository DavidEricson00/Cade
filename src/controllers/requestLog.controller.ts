import type { Request, Response } from 'express';

import { getLogsByDate } from '../services/requestLog.service.js';

export function getLogs(req: Request, res: Response) {
  const { date } = req.params;

  if (typeof date !== 'string') {
    res.status(400).json({
      success: false,
      code: 400,
      message: 'Data inválida',
    });

    return;
  }

  const logs = getLogsByDate(date);

  res.status(200).json({
    success: true,
    code: 200,
    message: 'Logs consultados com sucesso',
    data: logs,
  });
}