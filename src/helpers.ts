export function formatTime(current: number): string {
  const minutes = `${~~((current % 3600) / 60)}`.padStart(2, '0');
  const seconds = `${~~(current % 60)}`.padStart(2, '0');
  return `${minutes}:${seconds}`;
}
