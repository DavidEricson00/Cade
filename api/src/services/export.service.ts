import { getAllItems } from './items.service';
import { generateCsv, CsvColumn } from '../utils/generate-csv';
import { Item } from '../types/item';

const ITEM_COLUMNS: CsvColumn<Item>[] = [
  { header: 'ID', value: (item) => item.id },
  { header: 'Nome', value: (item) => item.name },
  { header: 'Descrição', value: (item) => item.description },
  { header: 'Local', value: (item) => item.location },
  { header: 'Data', value: (item) => item.date },
  { header: 'Imagem', value: (item) => item.imageUrl ?? '' },
];

export type ExportFilters = {
  from?: string;
  to?: string;
  delimiter?: ',' | ';';
};

export async function exportItemsCsv(filters: ExportFilters = {}) {
  const items = (await getAllItems()).filter(
    (item) =>
      (!filters.from || item.date >= filters.from) &&
      (!filters.to || item.date <= filters.to),
  );

  return {
    total: items.length,
    csv: generateCsv(items, ITEM_COLUMNS, filters.delimiter),
  };
}