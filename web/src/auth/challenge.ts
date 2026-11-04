import { createStore, useStore } from '../lib/store';

/**
 * Desafio de 2FA em andamento. Fica SÓ em memória:
 * nunca em storage nem na URL. Recarregar a página exige novo login.
 */
export type Challenge = {
  challengeToken: string;
  email: string;
  /** Validade do código em segundos, informada pela API. */
  expiresIn: number;
  /** Instante (ms) em que o código atual foi emitido. */
  issuedAt: number;
};

const challengeStore = createStore<Challenge | null>(null);

export function startChallenge(data: Omit<Challenge, 'issuedAt'>): void {
  challengeStore.set({ ...data, issuedAt: Date.now() });
}

export function renewChallenge(challengeToken: string, expiresIn: number): void {
  challengeStore.set((current) =>
    current ? { ...current, challengeToken, expiresIn, issuedAt: Date.now() } : current,
  );
}

export function clearChallenge(): void {
  challengeStore.set(null);
}

export function useChallenge(): Challenge | null {
  return useStore(challengeStore);
}

