import PDFDocument from 'pdfkit';
import { Item } from '../types/item';

export function generatePdf(items: Item[]): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Título
  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('RELATÓRIO DE ITENS ENCONTRADOS', { align: 'center' });

  doc.moveDown(1.5);

  // Configuração das colunas
  const tableTop = doc.y;
  const columns = {
    id: { label: 'ID', x: 40, width: 100 },
    name: { label: 'Nome', x: 140, width: 100 },
    description: { label: 'Descrição', x: 240, width: 140 },
    location: { label: 'Localização', x: 380, width: 110 },
    date: { label: 'Data', x: 490, width: 70 },
  };

  // Cabeçalho da tabela
  doc.fontSize(10).font('Helvetica-Bold');

  for (const col of Object.values(columns)) {
    doc.text(col.label, col.x, tableTop, {
      width: col.width,
      ellipsis: true,
    });
  }

  // Linha separadora do cabeçalho
  const headerLineY = tableTop + 15;
  doc
    .moveTo(40, headerLineY)
    .lineTo(560, headerLineY)
    .strokeColor('#333333')
    .lineWidth(1)
    .stroke();

  // Linhas de dados
  doc.font('Helvetica').fontSize(8);
  let y = headerLineY + 8;

  for (const item of items) {
    // Verifica se precisa de nova página
    if (y > 750) {
      doc.addPage();
      y = 40;
    }

    const shortId = item.id.substring(0, 8) + '...';

    doc.text(shortId, columns.id.x, y, {
      width: columns.id.width,
      ellipsis: true,
    });
    doc.text(item.name, columns.name.x, y, {
      width: columns.name.width,
      ellipsis: true,
    });
    doc.text(item.description, columns.description.x, y, {
      width: columns.description.width,
      ellipsis: true,
    });
    doc.text(item.location, columns.location.x, y, {
      width: columns.location.width,
      ellipsis: true,
    });
    doc.text(item.date, columns.date.x, y, {
      width: columns.date.width,
      ellipsis: true,
    });

    y += 20;

    // Linha separadora entre itens
    doc
      .moveTo(40, y - 5)
      .lineTo(560, y - 5)
      .strokeColor('#cccccc')
      .lineWidth(0.5)
      .stroke();
  }

  // Rodapé
  doc.moveDown(2);
  doc
    .fontSize(8)
    .font('Helvetica-Oblique')
    .fillColor('#666666')
    .text(
      `Relatório gerado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
      40,
      y + 10,
      { align: 'center' },
    );

  return doc;
}
