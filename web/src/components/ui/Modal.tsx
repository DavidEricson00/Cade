import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import styles from './Modal.module.css';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Elemento que deve receber foco ao abrir (padrão: primeiro focável). */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Modal no desktop / bottom sheet com alça no mobile (seção 9.7). */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  initialFocusRef,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTarget =
      initialFocusRef?.current ??
      dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    focusTarget?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, initialFocusRef]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.sheet}
        style={
          dragOffset > 0
            ? { transform: `translateY(${dragOffset}px)`, transition: 'none' }
            : undefined
        }
      >
        <div
          className={styles.handleArea}
          aria-hidden="true"
          onTouchStart={(event) => {
            dragStartY.current = event.touches[0]?.clientY ?? null;
          }}
          onTouchMove={(event) => {
            if (dragStartY.current === null) return;
            const delta = (event.touches[0]?.clientY ?? 0) - dragStartY.current;
            setDragOffset(Math.max(0, delta));
          }}
          onTouchEnd={() => {
            if (dragOffset > 88) {
              setDragOffset(0);
              onClose();
            } else {
              setDragOffset(0);
            }
            dragStartY.current = null;
          }}
        >
          <span className={styles.handle} />
        </div>

        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

export type ConfirmDeleteModalProps = {
  open: boolean;
  itemName: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Modal de confirmação de exclusão de item (seção 9.7). Foco inicial em Cancelar. */
export function ConfirmDeleteModal({
  open,
  itemName,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const cancelWrapRef = useRef<HTMLSpanElement>(null);
  const cancelButtonRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      cancelButtonRef.current =
        cancelWrapRef.current?.querySelector('button') ?? null;
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onCancel}
      title={`Excluir "${itemName}"?`}
      initialFocusRef={cancelButtonRef}
      footer={
        <>
          <span ref={cancelWrapRef}>
            <Button variant="ghost" disabled={loading} onClick={onCancel}>
              Cancelar
            </Button>
          </span>
          <Button
            variant="danger-solid"
            loading={loading}
            loadingLabel="Excluindo…"
            onClick={onConfirm}
          >
            Excluir item
          </Button>
        </>
      }
    >
      <p className="texto-suave">
        Isso apaga o registro e a foto. Não dá para desfazer.
      </p>
    </Modal>
  );
}

