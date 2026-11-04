export function toDay(date: Date | string): string {
  return date instanceof Date
    ? date.toISOString().slice(0, 10)
    : String(date).slice(0, 10);
}