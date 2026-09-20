import { Request, Response } from 'express';
import { generateReport } from '../services/report-service';

export function getReport(req: Request, res: Response): void {
  try {
    const doc = generateReport();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=relatorio-itens.pdf',
    );

    doc.pipe(res);
  } catch {
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Erro ao gerar relatório',
    });
  }
}
