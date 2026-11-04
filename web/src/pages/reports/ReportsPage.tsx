import { useState, type FormEvent } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { downloadCsv, downloadReport } from '../../api/reports';
import type { CsvDelimiter } from '../../api/types';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/Field';
import { FilterChips } from '../../components/ui/FilterBar';
import { showToast } from '../../components/ui/Toast';
import { saveBlob } from '../../lib/format';
import { PageHeader } from '../../layout/PageHeader';
import { usePageTitle } from '../../layout/page-title';
import styles from './ReportsLogsPages.module.css';

const DELIMITER_OPTIONS: readonly { value: CsvDelimiter; label: string }[] = [
  { value: ';', label: 'Ponto e vírgula (;)' },
  { value: ',', label: 'Vírgula (,)' },
];

export function ReportsPage() {
  usePageTitle('Relatórios');

  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(';');
  const [dateError, setDateError] = useState<string | undefined>(undefined);

  async function handleDownloadPdf() {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      const { blob, filename } = await downloadReport();
      saveBlob(blob, filename);
      showToast('Relatório em PDF baixado.', 'success');
    } catch {
      showToast('Não conseguimos gerar o relatório em PDF agora.', 'error');
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleDownloadCsv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (csvLoading) return;

    if (from && to && from > to) {
      setDateError('A data inicial não pode ser maior que a data final.');
      return;
    }

    setDateError(undefined);
    setCsvLoading(true);

    try {
      const { blob, filename, total } = await downloadCsv({
        from: from || undefined,
        to: to || undefined,
        delimiter,
      });
      saveBlob(blob, filename);
      if (total !== null) {
        showToast(
          `${total} ${total === 1 ? 'item exportado' : 'itens exportados'}.`,
          'success',
        );
      } else {
        showToast('Planilha CSV baixada.', 'success');
      }
    } catch {
      showToast('Não conseguimos exportar os dados em CSV agora.', 'error');
    } finally {
      setCsvLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Relatórios e exportação"
        meta="Documentos para conferência impressa ou planilha"
      />

      <div className={styles.cardsGrid}>
        {/* Bloco 1: PDF */}
        <section className={styles.tagCard}>
          <span className={styles.hole} aria-hidden="true" />
          <div className={styles.cardBody}>
            <div className={styles.cardTitleRow}>
              <FileText size={22} strokeWidth={1.75} aria-hidden="true" />
              <h2>Relatório em PDF</h2>
            </div>
            <p className="texto-suave">
              Lista de todos os objetos guardados no balcão, pronta para imprimir
              ou afixar no mural.
            </p>
          </div>
          <div className={styles.cardStub}>
            <span className="rotulo-mono texto-suave">relatorio-itens.pdf</span>
            <Button
              variant="secondary"
              icon={<Download size={18} strokeWidth={1.75} />}
              loading={pdfLoading}
              loadingLabel="Gerando relatório…"
              onClick={() => void handleDownloadPdf()}
            >
              Baixar PDF
            </Button>
          </div>
        </section>

        {/* Bloco 2: CSV */}
        <form noValidate onSubmit={handleDownloadCsv} className={styles.tagCard}>
          <span className={styles.hole} aria-hidden="true" />
          <div className={styles.cardBody}>
            <div className={styles.cardTitleRow}>
              <FileSpreadsheet size={22} strokeWidth={1.75} aria-hidden="true" />
              <h2>Exportar CSV</h2>
            </div>
            <p className="texto-suave">
              Baixe os registros em planilha, filtrando opcionalmente por período
              de entrada.
            </p>

            <div className={styles.dateRow}>
              <InputField
                label="Data inicial (opcional)"
                type="date"
                value={from}
                onChange={(event) => {
                  setDateError(undefined);
                  setFrom(event.target.value);
                }}
              />
              <InputField
                label="Data final (opcional)"
                type="date"
                value={to}
                error={dateError}
                onChange={(event) => {
                  setDateError(undefined);
                  setTo(event.target.value);
                }}
              />
            </div>

            <div className={styles.delimiterGroup}>
              <span className={styles.delimiterLabel}>Separador de colunas</span>
              <FilterChips
                label="Separador de colunas"
                options={DELIMITER_OPTIONS}
                value={delimiter}
                onChange={setDelimiter}
              />
              <p className="texto-pequeno texto-suave">
                Use ponto e vírgula para abrir no Excel em português.
              </p>
            </div>
          </div>

          <div className={styles.cardStub}>
            <span className="rotulo-mono texto-suave">UTF-8 com BOM</span>
            <Button
              type="submit"
              icon={<Download size={18} strokeWidth={1.75} />}
              loading={csvLoading}
              loadingLabel="Exportando…"
            >
              Baixar CSV
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
