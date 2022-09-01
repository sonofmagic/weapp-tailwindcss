export const mangleClassPrefix = 'MANGLE__'

export const mangleClassSuffix = '__MANGLE'

export const mangleClassRegex = /MANGLE__[a-zA-Z0-9_-]+__MANGLE/g

export function mangleMark (str: string) {
  if (typeof str === 'string' && str) {
    return str
      .split(' ')
      .filter((x) => x)
      .map((x) => {
        return `${mangleClassPrefix}${x}${mangleClassSuffix}`
      })
      .join(' ')
    // return `${mangleClassPrefix}${str.trim()}${mangleClassSuffix}`
  }
  return str
}
