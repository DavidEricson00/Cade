import { useEffect, useId, useRef } from 'react';
import { Search, X } from 'lucide-react';
import styles from './FilterBar.module.css';

export type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  /** Ativa o atalho "/" para focar o campo (padrão: true). */
  enableShortcut?: boolean;
};

function isTypingElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

/** Campo de busca largo com ícone à esquerda e atalho "/" no desktop (seção 9.5). */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar por nome, descrição ou local…',
  label = 'Buscar itens',
  enableShortcut = true,
}: SearchBarProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!enableShortcut) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingElement(event.target)) return;
      if (event.key === '/') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcut]);

  return (
    <div className={styles.searchWrap}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search size={20} strokeWidth={1.75} className={styles.searchIcon} aria-hidden="true" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      {value ? (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          aria-label="Limpar busca"
        >
          <X size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      ) : (
        enableShortcut && (
          <kbd className={styles.shortcut} aria-hidden="true">
            /
          </kbd>
        )
      )}
    </div>
  );
}

export type ChipOption<T extends string> = {
  value: T;
  label: string;
};

export type FilterChipsProps<T extends string> = {
  label: string;
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Chips retangulares de filtro (seção 9.5). */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: FilterChipsProps<T>) {
  return (
    <div role="group" aria-label={label} className={styles.chips}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            data-active={active || undefined}
            className={styles.chip}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

