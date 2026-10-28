import { getAllItems } from './items.service';
import { generatePdf } from '../utils/generate-pdf';

export async function generateReport(): Promise<PDFKit.PDFDocument> {
  const items = await getAllItems();
  
  const formattedItems = items.map((item) => ({
    ...item, 
    date: 
      item.date instanceof Date
        ? item.date.toISOString().slice(0, 10)
        : String(item.date),
    }))

    return generatePdf(formattedItems);
}
