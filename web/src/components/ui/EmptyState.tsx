import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export type EmptyIllustrationKind = 'counter' | 'search' | 'missing';

export type EmptyStateProps = {
  title: string;
  description: string;
  illustration?: EmptyIllustrationKind | ReactNode;
  action?: ReactNode;
};

/** Balcão vazio com etiqueta pendurada em barbante. */
function CounterSvg() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
      <path d="M12 96 H148" stroke="var(--tinta)" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 96 V112 M136 96 V112" stroke="var(--tinta)" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M80 12 C68 24 66 36 74 44"
        stroke="var(--tinta)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
      <g transform="rotate(-6 80 64)">
        <path
          d="M52 46 L60 36 H100 L108 46 V86 A4 4 0 0 1 104 90 H56 A4 4 0 0 1 52 86 Z"
          fill="var(--superficie)"
          stroke="var(--tinta)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="80" cy="44" r="3" fill="var(--papel)" stroke="var(--tinta)" strokeWidth="1.75" />
        <path d="M64 62 H96 M64 72 H86" stroke="var(--urucum)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Duas etiquetas desencontradas para busca sem resultado. */
function SearchSvg() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
      <g transform="rotate(-10 62 62)">
        <path
          d="M36 40 L44 30 H80 L88 40 V88 A4 4 0 0 1 84 92 H40 A4 4 0 0 1 36 88 Z"
          fill="var(--kraft)"
          stroke="var(--tinta)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="62" cy="38" r="2.8" fill="var(--papel)" stroke="var(--tinta)" strokeWidth="1.75" />
      </g>
      <g transform="rotate(8 98 64)">
        <path
          d="M72 38 L80 28 H116 L124 38 V86 A4 4 0 0 1 120 90 H76 A4 4 0 0 1 72 86 Z"
          fill="var(--superficie)"
          stroke="var(--tinta)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="98" cy="36" r="2.8" fill="var(--papel)" stroke="var(--tinta)" strokeWidth="1.75" />
        <path
          d="M91 54 A7 7 0 1 1 102 60 C99.5 61.5 98 63 98 66"
          stroke="var(--urucum)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="98" cy="73" r="1.4" fill="var(--urucum)" />
      </g>
    </svg>
  );
}

/** Barbante solto para 404 (item não está mais no balcão). */
function MissingSvg() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
      <circle cx="80" cy="18" r="4" stroke="var(--tinta)" strokeWidth="2" />
      <path
        d="M80 22 C80 38 66 44 74 58 C80 68 90 72 82 88"
        stroke="var(--tinta)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="44"
        y="74"
        width="72"
        height="30"
        rx="6"
        stroke="var(--urucum)"
        strokeWidth="1.75"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

function renderIllustration(illustration: EmptyStateProps['illustration']) {
  if (!illustration || illustration === 'counter') return <CounterSvg />;
  if (illustration === 'search') return <SearchSvg />;
  if (illustration === 'missing') return <MissingSvg />;
  return illustration;
}

/** Estado vazio / sem resultado / 404 dentro de uma página (seção 11). */
export function EmptyState({
  title,
  description,
  illustration = 'counter',
  action,
}: EmptyStateProps) {
  return (
    <section className={styles.empty}>
      <div className={styles.illustration} aria-hidden="true">
        {renderIllustration(illustration)}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.action}>{action}</div>}
    </section>
  );
}
