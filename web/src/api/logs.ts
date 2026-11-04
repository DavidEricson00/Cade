import { apiRequest } from './client';
import type { LogsMeta, RequestLog } from './types';

export async function getLogs(date: string, timeZone: string, signal?: AbortSignal) {
  const res = await apiRequest<RequestLog[]>(`/logs/${encodeURIComponent(date)}`, {
    headers: { 'x-timezone': timeZone },
    signal,
  });
  return {
    logs: res.data ?? [],
    meta: res.meta as LogsMeta,
  };
}

