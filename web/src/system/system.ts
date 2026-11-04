import { createStore, useStore } from '../lib/store';

/**
 * Estado global do sistema, alimentado pelo cliente de API.
 * - weekend: a API respondeu 403 (balcão fechado no fim de semana)
 * - unavailable: a API respondeu 503 "Banco de dados indisponível"
 * - offline: sem internet ou servidor inalcançável
 */
export type SystemMode = 'ok' | 'weekend' | 'unavailable';

export type SystemState = {
  mode: SystemMode;
  offline: boolean;
};

const systemStore = createStore<SystemState>({
  mode: 'ok',
  offline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
});

export function setSystemMode(mode: SystemMode): void {
  systemStore.set((state) => (state.mode === mode ? state : { ...state, mode }));
}

export function setOffline(offline: boolean): void {
  systemStore.set((state) => (state.offline === offline ? state : { ...state, offline }));
}

export function useSystem(): SystemState {
  return useStore(systemStore);
}

