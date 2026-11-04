import type { RequestLog } from '../../api/types';
import { formatTime } from '../../lib/date';
import styles from './LogTable.module.css';

export type MethodBadgeProps = {
  method: string;
};

function methodTone(method: string): 'get' | 'post' | 'patch' | 'delete' | 'other' {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'get';
    case 'POST':
      return 'post';
    case 'PATCH':
    case 'PUT':
      return 'patch';
    case 'DELETE':
      return 'delete';
    default:
      return 'other';
  }
}

/** Badge de método HTTP em mono 12px (seção 9.10). */
export function MethodBadge({ method }: MethodBadgeProps) {
  const upper = method.toUpperCase();
  return (
    <span className={styles.badge} data-method={methodTone(upper)}>
      {upper}
    </span>
  );
}

export type LogTableProps = {
  logs: RequestLog[];
  timeZone: string;
};

/**
 * Livro de registros de acesso (seção 9.9):
 * tabela no desktop, lista de cartões compactos no mobile (sem rolagem horizontal).
 */
export function LogTable({ logs, timeZone }: LogTableProps) {
  return (
    <div className={styles.wrapper}>
      {/* Desktop / Tablet */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Horário</th>
              <th scope="col">Método</th>
              <th scope="col">Rota</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className={styles.timeCell}>{formatTime(log.timestamp, timeZone)}</td>
                <td className={styles.methodCell}>
                  <MethodBadge method={log.method} />
                </td>
                <td className={styles.routeCell}>{log.route}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards compactos */}
      <ul className={styles.cardList}>
        {logs.map((log) => (
          <li key={log.id} className={styles.card}>
            <div className={styles.cardTop}>
              <MethodBadge method={log.method} />
              <span className={styles.cardTime}>{formatTime(log.timestamp, timeZone)}</span>
            </div>
            <div className={styles.cardRoute}>{log.route}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
