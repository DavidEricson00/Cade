import type { Request, Response } from 'express';

import { getLogsByDate, isValidTimezone } from '../services/requestLog.service.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function getLogs(req: Request, res: Response) {
  const date = req.params.date as string;

  if (!date) {
    res.status(400).json({
      success: false,
      code: 400,
      message: 'Data é obrigatória.',
    });
    return;
  }

  if (!DATE_REGEX.test(date) || isNaN(Date.parse(date))) {
    res.status(400).json({
      success: false,
      code: 400,
      message: 'Data inválida. Use o formato YYYY-MM-DD (ex: 2026-09-15).',
    });
    return;
  }

  const rawTimezone = req.headers['x-timezone'] as string | undefined;
  const timezone = rawTimezone?.trim() || 'UTC';

  if (!isValidTimezone(timezone)) {
    res.status(400).json({
      success: false,
      code: 400,
      message: `Timezone inválido: "${timezone}". Use um timezone IANA válido (ex: "America/Fortaleza").`,
    });
    return;
  }

  const logs = getLogsByDate(date, timezone);

  res.status(200).json({
    success: true,
    code: 200,
    message: 'Logs consultados com sucesso',
    meta: {
      date,
      timezone,
      total: logs.length,
    },
    data: logs,
  });
}