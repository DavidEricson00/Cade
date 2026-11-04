import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-solid';

type BaseProps = {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

export type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

function Spinner() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      className={styles.spinner}
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function classes(
  variant: ButtonVariant,
  fullWidth?: boolean,
  loading?: boolean,
  extra?: string,
): string {
  return [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    extra ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function Button({
  variant = 'primary',
  loading = false,
  loadingLabel = 'Salvando…',
  icon,
  fullWidth,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={classes(variant, fullWidth, loading, className)}
      {...rest}
    >
      {/* Mantém a largura original mesmo quando troca o texto para loadingLabel */}
      <span className={styles.face} data-hidden={loading || undefined}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span>{children}</span>
      </span>
      {loading && (
        <span className={styles.loadingFace}>
          <Spinner />
          <span>{loadingLabel}</span>
        </span>
      )}
    </button>
  );
}

export type ButtonLinkProps = Omit<BaseProps, 'loading' | 'loadingLabel'> &
  Omit<LinkProps, keyof BaseProps>;

export function ButtonLink({
  variant = 'primary',
  icon,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={classes(variant, fullWidth, false, className)} {...rest}>
      <span className={styles.face}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span>{children}</span>
      </span>
    </Link>
  );
}

export type ButtonAnchorProps = Omit<BaseProps, 'loading' | 'loadingLabel'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>;

export function ButtonAnchor({
  variant = 'secondary',
  icon,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonAnchorProps) {
  return (
    <a className={classes(variant, fullWidth, false, className)} {...rest}>
      <span className={styles.face}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span>{children}</span>
      </span>
    </a>
  );
}
