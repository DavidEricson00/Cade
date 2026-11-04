import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

type PageHeaderProps = {
  title: string;
  /** Texto curto abaixo do título (ex.: contador em mono). */
  meta?: ReactNode;
  /** Ações à direita (desktop) ou abaixo (mobile). */
  actions?: ReactNode;
};

/** Cabeçalho de página: H1 à esquerda, ações à direita. Uma única h1 por tela. */
export function PageHeader({ title, meta, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.text}>
        <h1>{title}</h1>
        {meta && <div className={styles.meta}>{meta}</div>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

