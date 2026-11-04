import type { Request, Response } from 'express';
import { z } from 'zod';
import { exportItemsCsv } from '../services/export.service';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const exportQuerySchema = z.object({
  from: z.string().regex(dateRegex).optional(),
  to: z.string().regex(dateRegex).optional(),
  delimiter: z.enum([',', ';']).optional(),
});

export async function exportItems(req: Request, res: Response) {
  const result = exportQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      code: 400,
      message:
        'Parâmetros inválidos. Use from/to no formato YYYY-MM-DD e delimiter "," ou ";"',
      data: result.error.issues,
    });
  }

  try {
    const { csv, total } = await exportItemsCsv(result.data);
    const today = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="itens-${today}.csv"`,
    );
    res.setHeader('X-Total-Count', String(total));

    return res.status(200).send(csv);
  } catch (error) {
    console.error('ERRO AO EXPORTAR CSV:', error);

    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Erro ao exportar dados',
    });
  }
}
