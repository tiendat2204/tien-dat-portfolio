const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

export function parsePublishedAt (value: string): Date | undefined {
  const match = DATE_ONLY.exec(value)
  const date = match
    ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
    : new Date(value)

  if (Number.isNaN(date.getTime())) return undefined
  // Reject overflowed date-only input such as 2025-02-31
  if (match && date.toISOString().slice(0, 10) !== value) return undefined
  return date
}
