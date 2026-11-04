import { apiDownload } from './client';
import type { CsvDelimiter } from './types';

export async function downloadReport() {
  const result = await apiDownload('/items/report');
  return { blob: result.blob, filename: result.filename ?? 'relatorio-itens.pdf' };
}

export async function downloadCsv(filters: { from?: string; to?: string; delimiter?: CsvDelimiter }) {
  const result = await apiDownload('/items/export', { query: filters });
  const total = Number(result.headers.get('X-Total-Count'));
  return {
    blob: result.blob,
    filename: result.filename ?? 'itens.csv',
    total: Number.isFinite(total) ? total : null,
  };
}

