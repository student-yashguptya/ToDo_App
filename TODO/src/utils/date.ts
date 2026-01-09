// For task total duration (minutes-based)
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60

  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
