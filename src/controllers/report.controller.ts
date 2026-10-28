import { Request, Response } from 'express';
import { generateReport } from '../services/report.service';

export async function getReport(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const doc = await generateReport();

    doc.on('error', (error: Error) => {
      console.error('ERRO NO PDF:', error);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          code: 500,
          message: 'Erro ao gerar relatório',
        });
      } else {
        res.destroy(error);
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=relatorio-itens.pdf',
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('ERRO AO GERAR RELATÓRIO:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        code: 500,
        message: 'Erro ao gerar relatório',
      });
    }
  }
}