/**
 * Tipos do contrato da API (Design System, seção 16).
 * Não adicionar campos que a API não envia.
 */

export type ApiEnvelope<T> = {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  meta?: unknown;
};

export type Item = {
  id: string;
  name: string;
  description: string;
  location: string;
  /** 'AAAA-MM-DD' */
  date: string;
  imageUrl?: string;
  imagePublicId?: string;
};

export type ItemFields = Pick<Item, 'name' | 'description' | 'location' | 'date'>;

export type RequestLog = {
  id: string;
  method: string;
  route: string;
  /** ISO 8601 em UTC */
  timestamp: string;
  timezone?: string;
};

export type LogsMeta = {
  date: string;
  timezone: string;
  total: number;
};

export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
};

export type LoginResult = {
  twoFactorRequired: true;
  challengeToken: string;
  expiresIn: number;
};

export type VerifyResult = {
  token: string;
};

export type ResendResult = {
  challengeToken: string;
  expiresIn: number;
  retryAfter: number;
};

/** Item de erro de validação do Zod devolvido em 400 (data). */
export type ValidationIssue = {
  path: (string | number)[];
  message: string;
  code?: string;
};

export type CsvDelimiter = ',' | ';';

