export const mangleClassPrefix = 'MANGLE__'

export const mangleClassSuffix = '__MANGLE'

export const mangleClassRegex = /MANGLE__[a-zA-Z0-9_-]+__MANGLE/g

export function markForMangled (str: string) {
  if (typeof str === 'string' && str) {
    return `${mangleClassPrefix}${str.trim()}${mangleClassSuffix}`
  }
  return str
}
