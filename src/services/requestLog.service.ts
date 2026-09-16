import { requestLogs } from '../data/request-logs.js';

export function getLogsByDate(date: string) {
  return requestLogs.filter((log) => {
    return log.timestamp.startsWith(date);
  });
}
