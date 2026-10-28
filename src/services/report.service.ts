import { getAllItems } from './items.service';
import { generatePdf } from '../utils/generate-pdf';

export async function generateReport(): Promise<PDFKit.PDFDocument> {
  const items = await getAllItems();
  return generatePdf(items);
}