import { Check } from 'lucide-react';
import { formatDay, formatStamp } from '../../lib/date';
import styles from './DateStamp.module.css';

export type DateStampProps = {
  /** Data no formato 'AAAA-MM-DD' */
  date: string;
  /** Sem rotação (ex.: em listas compactas) */
  flat?: boolean;
  /** Animação de "carimbo batendo" ao aparecer */
  animate?: boolean;
  className?: string;
};

/** Carimbo de data (seção 9.4): ACHADO · 03 NOV */
export function DateStamp({ date, flat = false, animate = false, className }: DateStampProps) {
  const shortText = formatStamp(date);
  const fullDate = formatDay(date);

  return (
    <span
      className={[
        styles.stamp,
        flat ? styles.flat : '',
        animate ? styles.animate : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={`Achado em ${fullDate}`}
    >
      <Check size={12} strokeWidth={2.25} aria-hidden="true" />
      <span>ACHADO · {shortText}</span>
    </span>
  );
}
