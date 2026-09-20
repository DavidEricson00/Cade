import { requestLogs } from '../data/request-logs.js';

export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function dateToUtcInterval(date: string, timezone: string): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00`);
  const offsetMs = getUtcOffsetMs(start, timezone);
  const startUtc = new Date(start.getTime() - offsetMs);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);

  return { start: startUtc, end: endUtc };
}

function getUtcOffsetMs(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);

  const localDate = new Date(
    Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  );

  return date.getTime() - localDate.getTime();
}

export function getLogsByDate(date: string, timezone: string) {
  const { start, end } = dateToUtcInterval(date, timezone);

  return requestLogs.filter((log) => {
    const ts = new Date(log.timestamp);
    return ts >= start && ts < end;
  });
}
