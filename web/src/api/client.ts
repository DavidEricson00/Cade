import { getSessionToken } from '../auth/session';
import type { ApiEnvelope } from './types';

/**
 * Cliente único da API. Todas as chamadas passam por aqui.
 * Sempre na mesma origem (/api), para que 403 e 503 cheguem legíveis.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const DB_UNAVAILABLE_MESSAGE = 'Banco de dados indisponível';

/** 'session' envia o JWT se houver; challenge envia o token do 2FA. */
export type AuthMode = 'session' | 'none' | { challengeToken: string };

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  json?: unknown;
  formData?: FormData;
  query?: Record<string, string | undefined>;
  headers?: Record<string, string>;
  auth?: AuthMode;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;
  readonly retryAfter?: number;

  constructor(status: number, message: string, data?: unknown, retryAfter?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.retryAfter = retryAfter;
  }

  /** Falha de rede: sem internet ou servidor inalcançável. */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

export type ApiHandlers = {
  /** 401 numa requisição que enviou o JWT de sessão. */
  onUnauthorized?: () => void;
  /** 403: a API só atende de segunda a sexta. */
  onWeekend?: () => void;
  /** 503 "Banco de dados indisponível". */
  onUnavailable?: () => void;
  /** fetch falhou antes de receber resposta. */
  onNetworkError?: () => void;
  /** Recebemos qualquer resposta do servidor. */
  onReachable?: () => void;
};

let handlers: ApiHandlers = {};

export function setApiHandlers(next: ApiHandlers): void {
  handlers = next;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, value);
  }
  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

async function readJson(response: Response): Promise<Partial<ApiEnvelope<unknown>> | null> {
  try {
    const body: unknown = await response.json();
    return body && typeof body === 'object' ? (body as Partial<ApiEnvelope<unknown>>) : null;
  } catch {
    return null;
  }
}

function readRetryAfter(response: Response, data: unknown): number | undefined {
  if (data && typeof data === 'object' && 'retryAfter' in data) {
    const value = (data as { retryAfter: unknown }).retryAfter;
    if (typeof value === 'number' && value > 0) return value;
  }
  const header = Number(response.headers.get('Retry-After'));
  return Number.isFinite(header) && header > 0 ? header : undefined;
}

async function toApiError(response: Response, sentSessionToken: boolean): Promise<ApiError> {
  const body = await readJson(response);
  const message =
    typeof body?.message === 'string' && body.message ? body.message : 'Erro inesperado';
  const error = new ApiError(
    response.status,
    message,
    body?.data,
    readRetryAfter(response, body?.data),
  );

  if (response.status === 403) {
    handlers.onWeekend?.();
  } else if (response.status === 503 && message === DB_UNAVAILABLE_MESSAGE) {
    handlers.onUnavailable?.();
  } else if (response.status === 401 && sentSessionToken) {
    handlers.onUnauthorized?.();
  }

  return error;
}

async function send(path: string, options: RequestOptions, accept: string): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Accept', accept);

  let body: BodyInit | undefined;
  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.json);
  } else if (options.formData) {
    // Sem Content-Type manual: o navegador define o boundary do multipart.
    body = options.formData;
  }

  const auth = options.auth ?? 'session';
  let sentSessionToken = false;

  if (auth === 'session') {
    const token = getSessionToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      sentSessionToken = true;
    }
  } else if (typeof auth === 'object') {
    headers.set('Authorization', `Bearer ${auth.challengeToken}`);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers,
      body,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    handlers.onNetworkError?.();
    throw new ApiError(0, 'Não foi possível falar com o servidor');
  }

  handlers.onReachable?.();

  if (!response.ok) throw await toApiError(response, sentSessionToken);
  return response;
}

/** Requisição JSON. Devolve o envelope completo da API. */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const response = await send(path, options, 'application/json');

  if (response.status === 204) {
    return { success: true, code: 204, message: '' };
  }

  const body = await readJson(response);
  if (!body) throw new ApiError(response.status, 'Resposta inválida do servidor');
  return body as ApiEnvelope<T>;
}

export type DownloadResult = {
  blob: Blob;
  filename: string | null;
  headers: Headers;
};

function readFilename(disposition: string | null): string | null {
  if (!disposition) return null;
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (encoded?.[1]) return decodeURIComponent(encoded[1]);
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain?.[1] ?? null;
}

/** Download de arquivo (PDF, CSV). */
export async function apiDownload(
  path: string,
  options: RequestOptions = {},
): Promise<DownloadResult> {
  const response = await send(path, options, '*/*');
  return {
    blob: await response.blob(),
    filename: readFilename(response.headers.get('Content-Disposition')),
    headers: response.headers,
  };
}

