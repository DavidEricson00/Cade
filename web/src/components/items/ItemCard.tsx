import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, MapPin, PackageOpen } from 'lucide-react';
import type { Item } from '../../api/types';
import { formatDay } from '../../lib/date';
import { itemCode } from '../../lib/format';
import { DateStamp } from './DateStamp';
import styles from './ItemCard.module.css';

export type ItemCardProps = {
  item: Item;
  /** Fita adesiva amarela decorativa (usar no máx. 1 por tela) */
  showTape?: boolean;
  /** Destino customizado do link (padrão: /itens/:id) */
  to?: string;
};

/** Cartão-etiqueta de item (seção 9.3). */
export function ItemCard({ item, showTape = false, to }: ItemCardProps) {
  const code = itemCode(item.id);
  const href = to ?? `/itens/${encodeURIComponent(item.id)}`;

  return (
    <Link
      to={href}
      className={styles.card}
      aria-label={`${item.name}, achado em ${item.location} no dia ${formatDay(item.date)}`}
    >
      {showTape && <span className={styles.tape} aria-hidden="true" />}

      <div className={styles.top}>
        <div className={styles.media}>
          <span className={styles.hole} aria-hidden="true" />
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              width={400}
              height={300}
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder} aria-hidden="true">
              <PackageOpen size={28} strokeWidth={1.75} />
              <span className="rotulo-mono">Sem foto</span>
            </div>
          )}
          <div className={styles.stampOverlay}>
            <DateStamp date={item.date} />
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.mobileStamp}>
            <DateStamp date={item.date} flat />
          </div>
          <h3 className={styles.title}>{item.name}</h3>
          <p className={styles.meta}>
            <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>{item.location}</span>
          </p>
        </div>
      </div>

      <div className={styles.stub}>
        <span className={styles.code}>{code}</span>
        <span className={styles.action}>
          <span>Ver detalhes</span>
          <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

/** Skeleton de carregamento do cartão-etiqueta (pulsando suave em kraft). */
export function ItemCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeleton}`} aria-hidden="true">
      <div className={styles.top}>
        <div className={styles.media}>
          <span className={styles.hole} />
          <div className={styles.skeletonPhoto} />
        </div>
        <div className={styles.body}>
          <div className={styles.skeletonLineLg} />
          <div className={styles.skeletonLineSm} />
        </div>
      </div>
      <div className={styles.stub}>
        <span className={styles.skeletonCode} />
        <span className={styles.skeletonCode} />
      </div>
    </div>
  );
}

/** Grade responsiva de cartões-etiqueta (seção 5). */
export function ItemGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

