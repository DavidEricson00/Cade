export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

/**
 * Escapa um valor conforme a RFC 4180 e neutraliza "CSV injection"
 * (células iniciadas por =, +, -, @ que planilhas interpretariam como fórmula).
 */
function escapeCell(raw: unknown, delimiter: string): string {
  let value = raw === null || raw === undefined ? '' : String(raw);

  if (/^[=+\-@\t\r]/.test(value)) {
    value = `'${value}`;
  }

  const mustQuote =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r');

  return mustQuote ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Gera um CSV a partir de uma lista de objetos.
 * Inclui BOM UTF-8 para que o Excel exiba acentos corretamente.
 */
export function generateCsv<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  delimiter = ',',
): string {
  const header = columns
    .map((col) => escapeCell(col.header, delimiter))
    .join(delimiter);

  const lines = rows.map((row) =>
    columns.map((col) => escapeCell(col.value(row), delimiter)).join(delimiter),
  );

  return '\uFEFF' + [header, ...lines].join('\r\n') + '\r\n';
}
