const APP_TIME_ZONE = "America/Sao_Paulo"

export function formatLocalDate(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

export function parseCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, Math.max(0, month - 1), day, 12, 0, 0)
}

export function formatCalendarDate(value: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—"
  return parseCalendarDate(value).toLocaleDateString("pt-BR", options)
}

export function formatDateTime(value: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—"
  return new Date(value).toLocaleString("pt-BR", {
    timeZone: APP_TIME_ZONE,
    ...options,
  })
}

export function addDays(value: string, days: number) {
  const date = parseCalendarDate(value)
  date.setDate(date.getDate() + days)
  return formatLocalDate(date)
}

