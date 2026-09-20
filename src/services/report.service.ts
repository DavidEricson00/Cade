import { getAllItems } from './items.service';
import { generatePdf } from '../utils/generate-pdf';

export function generateReport(): PDFKit.PDFDocument {
  const items = getAllItems();
  return generatePdf(items);
}
