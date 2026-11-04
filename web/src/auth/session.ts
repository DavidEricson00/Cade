import { createStore, useStore } from '../lib/store';

/**
 * Sessão do usuário: JWT + e-mail usado no login.
 * Fica em sessionStorage (sobrevive a recarregar a aba, some ao fechá-la).
 * A API não tem /auth/me, então o e-mail é a única informação do usuário.
 */
export type Session = {
  token: string;
  email: string;
  /** Instante (ms) em que o JWT expira, lido do campo exp. */
  expiresAt: number | null;
};

const TOKEN_KEY = 'cade.token';
const EMAIL_KEY = 'cade.email';

/** Decodifica o payload do JWT apenas para exibição (sem verificar assinatura). */
export function readTokenExpiration(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isExpired(session: Session): boolean {
  return session.expiresAt !== null && session.expiresAt <= Date.now();
}

function clearStorage() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
  } catch {
    /* storage indisponível: nada a limpar */
  }
}

function loadSession(): Session | null {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const email = sessionStorage.getItem(EMAIL_KEY);
    if (!token || !email) return null;

    const session: Session = { token, email, expiresAt: readTokenExpiration(token) };
    if (isExpired(session)) {
      clearStorage();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

const sessionStore = createStore<Session | null>(loadSession());

export function getSession(): Session | null {
  const session = sessionStore.get();
  if (session && isExpired(session)) {
    signOut();
    return null;
  }
  return session;
}

export function getSessionToken(): string | null {
  return getSession()?.token ?? null;
}

export function signIn(token: string, email: string): void {
  const session: Session = { token, email, expiresAt: readTokenExpiration(token) };
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(EMAIL_KEY, email);
  } catch {
    /* sem storage: a sessão vale só enquanto a página estiver aberta */
  }
  sessionStore.set(session);
}

export function signOut(): void {
  clearStorage();
  sessionStore.set(null);
}

export function useSession(): Session | null {
  return useStore(sessionStore);
}

/**
 * Aviso de "sessão acabou" mostrado no login depois de um 401.
 * O redirecionamento em si é feito por RequireAuth quando a sessão some.
 */
const expiredStore = createStore(false);

export function expireSession(): void {
  signOut();
  expiredStore.set(true);
}

export function dismissSessionExpired(): void {
  expiredStore.set(false);
}

export function useSessionExpired(): boolean {
  return useStore(expiredStore);
}
