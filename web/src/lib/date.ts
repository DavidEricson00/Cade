/**
 * Datas da API chegam como 'AAAA-MM-DD' (sem horário).
 * Nunca usar new Date('AAAA-MM-DD') para exibir: isso vira o dia anterior no Brasil.
 * Todas as funções aqui trabalham em UTC para não deslocar o dia.
 */

const DAY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

export type DayParts = { year: number; month: number; day: number };

export function parseDay(value: string): DayParts | null {
  const match = DAY_REGEX.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function toUtcDate(value: string): Date | null {
  const parts = parseDay(value);
  if (!parts) return null;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function format(value: string, options: Intl.DateTimeFormatOptions): string {
  const date = toUtcDate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'UTC' }).format(date);
}

/** 03/11/2026 */
export function formatDay(value: string): string {
  return format(value, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** 3 de nov. */
export function formatDayShort(value: string): string {
  return format(value, { day: 'numeric', month: 'short' });
}

/** 3 de novembro de 2026 */
export function formatDayLong(value: string): string {
  return format(value, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Texto do carimbo: "03 NOV" ou "03 NOV 2025" se não for o ano atual. */
export function formatStamp(value: string, now: Date = new Date()): string {
  const parts = parseDay(value);
  if (!parts) return value.toUpperCase();
  const month = format(value, { month: 'short' }).replace('.', '').toUpperCase();
  const day = String(parts.day).padStart(2, '0');
  return parts.year === now.getFullYear() ? `${day} ${month}` : `${day} ${month} ${parts.year}`;
}

/** Data de hoje como 'AAAA-MM-DD' num fuso (padrão: o do navegador). */
export function todayISO(timeZone?: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Diferença em dias entre hoje (fuso local) e a data informada. */
export function daysAgo(value: string): number | null {
  const date = toUtcDate(value);
  const today = toUtcDate(todayISO());
  if (!date || !today) return null;
  return Math.round((today.getTime() - date.getTime()) / 86_400_000);
}

/** Hora 24h de um timestamp ISO num fuso: 14:05:32 */
export function formatTime(timestamp: string, timeZone?: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(timestamp));
}

/** Data e hora de um instante (ms): 04/11/2026, 23:31 */
export function formatDateTime(ms: number): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(ms));
}

export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

