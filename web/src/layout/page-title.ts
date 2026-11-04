import { useEffect } from 'react';
import { createStore, useStore } from '../lib/store';

const titleStore = createStore('');

/** Define o título da tela (barra superior no mobile + document.title). */
export function usePageTitle(title: string): void {
  useEffect(() => {
    titleStore.set(title);
    document.title = title ? `${title} · O Cadê?` : 'O Cadê?';
  }, [title]);
}

export function useCurrentPageTitle(): string {
  return useStore(titleStore);
}

