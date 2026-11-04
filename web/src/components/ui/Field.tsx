import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { AlertCircle, ChevronDown, Eye, EyeOff } from 'lucide-react';
import styles from './Field.module.css';

type FieldMetaProps = {
  label: string;
  hint?: ReactNode;
  error?: string;
  corner?: ReactNode;
  id?: string;
};

function useFieldIds(providedId?: string, hint?: ReactNode, error?: string) {
  const autoId = useId();
  const id = providedId ?? autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  return { id, hintId, errorId, describedBy };
}

function FieldShell({
  id,
  label,
  hint,
  error,
  corner,
  hintId,
  errorId,
  children,
}: FieldMetaProps & {
  id: string;
  hintId?: string;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {corner && <span className={styles.corner}>{corner}</span>}
      </div>
      {children}
      {error && (
        <p id={errorId} role="alert" className={styles.errorText}>
          <AlertCircle size={14} strokeWidth={1.75} aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

export type InputFieldProps = FieldMetaProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>;

export function InputField({
  label,
  hint,
  error,
  corner,
  id: providedId,
  className,
  ...rest
}: InputFieldProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(providedId, hint, error);

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      corner={corner}
      hintId={hintId}
      errorId={errorId}
    >
      <input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        data-error={Boolean(error) || undefined}
        className={`${styles.control} ${className ?? ''}`}
        {...rest}
      />
    </FieldShell>
  );
}

export type PasswordFieldProps = Omit<InputFieldProps, 'type'>;

export function PasswordField({
  label,
  hint,
  error,
  corner,
  id: providedId,
  className,
  ...rest
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const { id, hintId, errorId, describedBy } = useFieldIds(providedId, hint, error);

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      corner={corner}
      hintId={hintId}
      errorId={errorId}
    >
      <div className={styles.passwordWrap}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          data-error={Boolean(error) || undefined}
          className={`${styles.control} ${styles.passwordInput} ${className ?? ''}`}
          {...rest}
        />
        <button
          type="button"
          className={styles.eyeButton}
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff size={20} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Eye size={20} strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      </div>
    </FieldShell>
  );
}

export type TextareaFieldProps = FieldMetaProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
    showCount?: boolean;
  };

export function TextareaField({
  label,
  hint,
  error,
  corner,
  id: providedId,
  value,
  defaultValue,
  showCount = true,
  onChange,
  className,
  ...rest
}: TextareaFieldProps) {
  const [localLength, setLocalLength] = useState(() =>
    typeof defaultValue === 'string' ? defaultValue.length : 0,
  );
  const { id, hintId, errorId, describedBy } = useFieldIds(providedId, hint, error);

  const count =
    typeof value === 'string' ? value.length : localLength;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      corner={
        corner ??
        (showCount ? (
          <span className={styles.counter} aria-live="off">
            {count} {count === 1 ? 'caractere' : 'caracteres'}
          </span>
        ) : undefined)
      }
      hintId={hintId}
      errorId={errorId}
    >
      <textarea
        id={id}
        value={value}
        defaultValue={defaultValue}
        rows={rest.rows ?? 4}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        data-error={Boolean(error) || undefined}
        className={`${styles.control} ${styles.textarea} ${className ?? ''}`}
        onChange={(event) => {
          if (value === undefined) setLocalLength(event.target.value.length);
          onChange?.(event);
        }}
        {...rest}
      />
    </FieldShell>
  );
}

export type SelectFieldProps = FieldMetaProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>;

export function SelectField({
  label,
  hint,
  error,
  corner,
  id: providedId,
  className,
  children,
  ...rest
}: SelectFieldProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(providedId, hint, error);

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      corner={corner}
      hintId={hintId}
      errorId={errorId}
    >
      <div className={styles.selectWrap}>
        <select
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          data-error={Boolean(error) || undefined}
          className={`${styles.control} ${styles.select} ${className ?? ''}`}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          className={styles.selectIcon}
          aria-hidden="true"
        />
      </div>
    </FieldShell>
  );
}

