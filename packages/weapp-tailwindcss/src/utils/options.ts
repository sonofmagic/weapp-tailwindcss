export function resolveBooleanObjectOption<T extends object>(
  value: boolean | T | undefined,
  enabledValue: T,
): T | false {
  if (!value) {
    return false
  }
  if (value === true) {
    return enabledValue
  }
  return value
}

export function normalizeStringListOption(value: unknown): string[] | undefined {
  if (!value) {
    return undefined
  }

  const values = typeof value === 'string'
    ? [value]
    : Array.isArray(value)
      ? value
      : undefined

  if (!values) {
    return undefined
  }

  const normalized = values
    .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(entry => entry.length > 0)

  return normalized.length > 0 ? normalized : undefined
}
