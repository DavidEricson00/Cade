import styles from './Logo.module.css';

type TagIconProps = { size?: number; className?: string };

/** Etiqueta de barbante com "?" em traço (seção 7). Decorativa. */
export function TagIcon({ size = 32, className }: TagIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9 L11 3 H21 L26 9 V27 A2 2 0 0 1 24 29 H8 A2 2 0 0 1 6 27 Z" />
      <circle cx="16" cy="8" r="1.8" />
      <path d="M12.8 15.2 A3.2 3.2 0 1 1 17.6 18 C16.6 18.6 16 19.3 16 20.6" />
      <path d="M16 24.2 V24.3" />
    </svg>
  );
}

type LogoProps = { size?: 'sm' | 'md' | 'lg'; showIcon?: boolean };

export function Logo({ size = 'md', showIcon = true }: LogoProps) {
  const iconSize = size === 'lg' ? 40 : size === 'sm' ? 24 : 30;

  return (
    <span className={`${styles.logo} ${styles[size]}`}>
      {showIcon && <TagIcon size={iconSize} className={styles.icon} />}
      <span className={styles.wordmark}>
        Cadê<span className={styles.question}>?</span>
      </span>
    </span>
  );
}

