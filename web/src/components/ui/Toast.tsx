import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { createStore, useStore } from '../../lib/store';
import styles from './Toast.module.css';

export type ToastKind = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
};

const toastStore = createStore<ToastItem[]>([]);
const timers = new Map<string, ReturnType<typeof setTimeout>>();

let seq = 0;

export function showToast(message: string, kind: ToastKind = 'success'): string {
  const id = `toast-${++seq}`;
  toastStore.set((items) => [...items, { id, kind, message }]);

  // Erros ficam até o usuário fechar; demais somem em 5s.
  if (kind !== 'error') {
    const timer = setTimeout(() => dismissToast(id), 5000);
    timers.set(id, timer);
  }

  return id;
}

export function dismissToast(id: string): void {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toastStore.set((items) => items.filter((item) => item.id !== id));
}

function ToastIcon({ kind }: { kind: ToastKind }) {
  if (kind === 'error') {
    return <AlertCircle size={18} strokeWidth={1.75} className={styles.iconError} aria-hidden="true" />;
  }
  if (kind === 'info') {
    return <Info size={18} strokeWidth={1.75} className={styles.iconInfo} aria-hidden="true" />;
  }
  return <CheckCircle2 size={18} strokeWidth={1.75} className={styles.iconSuccess} aria-hidden="true" />;
}

/** Região fixa de toasts (mobile: acima da tab bar; desktop: canto inferior direito). */
export function ToastViewport() {
  const toasts = useStore(toastStore);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.viewport}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.kind === 'error' ? 'alert' : 'status'}
          aria-live={toast.kind === 'error' ? 'assertive' : 'polite'}
          data-kind={toast.kind}
          className={styles.toast}
        >
          <ToastIcon kind={toast.kind} />
          <span className={styles.message}>{toast.message}</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => dismissToast(toast.id)}
            aria-label="Fechar aviso"
          >
            <X size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

export type InlineNoticeProps = {
  tone?: 'warning' | 'error' | 'success';
  children: ReactNode;
  className?: string;
};

/** Aviso inline (cooldown, limites, alertas de formulário — seção 9.8). */
export function InlineNotice({
  tone = 'warning',
  children,
  className,
}: InlineNoticeProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      data-tone={tone}
      className={`${styles.notice} ${className ?? ''}`}
    >
      {tone === 'error' ? (
        <AlertCircle size={18} strokeWidth={1.75} aria-hidden="true" />
      ) : tone === 'success' ? (
        <CheckCircle2 size={18} strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Info size={18} strokeWidth={1.75} aria-hidden="true" />
      )}
      <div className={styles.noticeContent}>{children}</div>
    </div>
  );
}

