import { listItems } from './item-service';
import { generatePdf } from '../utils/generate-pdf';

export function generateReport(): PDFKit.PDFDocument {
  const items = listItems();
  return generatePdf(items);
}
