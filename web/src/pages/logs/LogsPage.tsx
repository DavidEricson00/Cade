import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ApiError } from '../../api/client';
import { getLogs } from '../../api/logs';
import type { RequestLog } from '../../api/types';
import { LogTable } from '../../components/logs/LogTable';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { InputField, SelectField } from '../../components/ui/Field';
import { FilterChips } from '../../components/ui/FilterBar';
import {
  browserTimeZone,
  formatDay,
  todayISO,
} from '../../lib/date';
import { PageHeader } from '../../layout/PageHeader';
import { usePageTitle } from '../../layout/page-title';
import styles from '../reports/ReportsLogsPages.module.css';

type MethodFilter = 'TODOS' | 'GET' | 'POST' | 'PATCH' | 'DELETE';

const METHOD_CHIPS: readonly { value: MethodFilter; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
];

const FALLBACK_TIMEZONES = [
  'America/Fortaleza',
  'America/Sao_Paulo',
  'America/Manaus',
  'America/Belem',
  'America/Recife',
  'UTC',
];

function getSupportedTimeZones(current: string): string[] {
  try {
    const list =
      typeof Intl.supportedValuesOf === 'function'
        ? Intl.supportedValuesOf('timeZone')
        : FALLBACK_TIMEZONES;
    return list.includes(current) ? list : [current, ...list];
  } catch {
    return FALLBACK_TIMEZONES;
  }
}

export function LogsPage() {
  usePageTitle('Registros de acesso');

  const initialTz = useMemo(() => browserTimeZone(), []);
  const [timeZone, setTimeZone] = useState(initialTz);
  const [date, setDate] = useState(() => todayISO(initialTz));
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('TODOS');

  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [serverError, setServerError] = useState(false);

  const timeZones = useMemo(() => getSupportedTimeZones(initialTz), [initialTz]);

  const fetchLogs = useCallback(
    async (signal?: AbortSignal) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        setFieldError('Use uma data válida no formato AAAA-MM-DD.');
        return;
      }

      setLoading(true);
      setFieldError(undefined);
      setServerError(false);

      try {
        const result = await getLogs(date, timeZone, signal);
        const sorted = [...result.logs].sort((a, b) =>
          b.timestamp.localeCompare(a.timestamp),
        );
        setLogs(sorted);
        setTotal(result.meta?.total ?? sorted.length);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (err instanceof ApiError && err.status === 400) {
          setFieldError(err.message);
        } else {
          setServerError(true);
        }
      } finally {
        setLoading(false);
      }
    },
    [date, timeZone],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchLogs(controller.signal);
    return () => controller.abort();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    if (methodFilter === 'TODOS') return logs;
    return logs.filter((log) => log.method.toUpperCase() === methodFilter);
  }, [logs, methodFilter]);

  const metaSummary = loading
    ? 'Consultando livro de registro…'
    : `${total} ${total === 1 ? 'registro' : 'registros'} em ${formatDay(date)} · ${timeZone}`;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Registros de acesso"
        meta={<span aria-live="polite">{metaSummary}</span>}
        actions={
          <Button
            variant="secondary"
            icon={<RefreshCw size={18} strokeWidth={1.75} />}
            onClick={() => void fetchLogs()}
          >
            Atualizar
          </Button>
        }
      />

      <section aria-label="Filtros de registro" className={styles.logsToolbar}>
        <div className={styles.logsControls}>
          <InputField
            label="Data da consulta"
            type="date"
            value={date}
            error={fieldError}
            onChange={(event) => setDate(event.target.value)}
          />

          <SelectField
            label="Fuso horário (x-timezone)"
            value={timeZone}
            onChange={(event) => setTimeZone(event.target.value)}
          >
            {timeZones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </SelectField>
        </div>

        <FilterChips
          label="Filtrar por método HTTP"
          options={METHOD_CHIPS}
          value={methodFilter}
          onChange={setMethodFilter}
        />
      </section>

      {loading ? (
        <div className={styles.logsSkeleton} aria-hidden="true" />
      ) : serverError ? (
        <EmptyState
          illustration="counter"
          title="Algo saiu do lugar"
          description="Não conseguimos consultar os registros agora. Tente novamente."
          action={
            <Button variant="secondary" onClick={() => void fetchLogs()}>
              Tentar novamente
            </Button>
          }
        />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          illustration="counter"
          title="Nenhum registro neste dia"
          description={
            methodFilter === 'TODOS'
              ? 'Não houve requisições registradas na data escolhida.'
              : `Nenhuma requisição ${methodFilter} registrada nesta data.`
          }
          action={
            methodFilter !== 'TODOS' ? (
              <Button
                variant="secondary"
                onClick={() => setMethodFilter('TODOS')}
              >
                Mostrar todos os métodos
              </Button>
            ) : undefined
          }
        />
      ) : (
        <LogTable logs={filteredLogs} timeZone={timeZone} />
      )}

      <p className="texto-pequeno texto-suave">
        Registros ficam guardados apenas enquanto o servidor estiver ligado.
      </p>
    </div>
  );
}
