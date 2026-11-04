import type { ReactNode } from 'react';
import { Logo } from '../components/brand/Logo';
import styles from './StatusScreen.module.css';

type StatusScreenProps = {
  title: string;
  description: string;
  illustration: ReactNode;
  action?: ReactNode;
};

/** Tela cheia para estados do sistema (fim de semana, banco indisponível). */
export function StatusScreen({ title, description, illustration, action }: StatusScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <Logo size="sm" />
      </header>
      <main className={styles.main}>
        <div className={styles.illustration} aria-hidden="true">
          {illustration}
        </div>
        <h1 className="display">{title}</h1>
        <p className={styles.description}>{description}</p>
        {action && <div className={styles.action}>{action}</div>}
      </main>
    </div>
  );
}

/** Placa pendurada de "Fechado" (403 fim de semana). */
export function ClosedSign() {
  return (
    <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
      <circle cx="100" cy="12" r="5" stroke="var(--tinta)" strokeWidth="2" />
      <path d="M100 17 L42 62 M100 17 L158 62" stroke="var(--tinta)" strokeWidth="1.75" />
      <g transform="rotate(-3 100 100)">
        <rect x="26" y="58" width="148" height="80" rx="8" fill="var(--superficie)" stroke="var(--tinta)" strokeWidth="2" />
        <rect x="34" y="66" width="132" height="64" rx="4" stroke="var(--urucum)" strokeWidth="1.5" />
        <circle cx="42" cy="64" r="3" fill="var(--papel)" stroke="var(--tinta)" strokeWidth="1.5" />
        <circle cx="158" cy="64" r="3" fill="var(--papel)" stroke="var(--tinta)" strokeWidth="1.5" />
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fill="var(--urucum)"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="22"
          fontWeight="500"
          letterSpacing="3"
        >
          FECHADO
        </text>
      </g>
    </svg>
  );
}

/** Gaveta de arquivo entreaberta (503). */
export function DrawerIllustration() {
  return (
    <svg width="200" height="150" viewBox="0 0 200 150" fill="none" stroke="var(--tinta)" strokeWidth="2" strokeLinejoin="round">
      <rect x="40" y="20" width="120" height="120" rx="6" fill="var(--superficie)" />
      <rect x="52" y="34" width="96" height="40" rx="3" />
      <path d="M88 52 H112" strokeLinecap="round" />
      <rect x="62" y="84" width="96" height="44" rx="3" fill="var(--kraft)" />
      <path d="M98 104 H122" strokeLinecap="round" />
      <path d="M76 84 L84 70 H102 L110 84" fill="var(--superficie)" strokeWidth="1.75" />
      <circle cx="93" cy="76" r="2" strokeWidth="1.5" />
    </svg>
  );
}

