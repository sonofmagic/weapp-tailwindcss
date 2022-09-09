import { MappingChars2StringEntries as entries } from '@/dic'

// https://github.com/sindresorhus/escape-string-regexp
function escapeStringRegexp (str: string) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

export function escape (selectors: string, raw?: boolean) {
  let res = selectors
  for (let i = 0; i < entries.length; i++) {
    const [searchValue, replaceValue] = entries[i]
    res = res.replace(new RegExp((raw ? '\\\\' : '') + escapeStringRegexp(searchValue), 'g'), replaceValue)
  }
  return res
}
