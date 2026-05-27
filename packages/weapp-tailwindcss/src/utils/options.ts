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
