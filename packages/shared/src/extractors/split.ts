// 参考链接：https://github.com/tailwindlabs/tailwindcss/blob/master/src/lib/regex.js
// eslint-disable-next-line regexp/no-obscure-range
export const validateFilterRE = /[\w\u00A0-\uFFFF%-?]/

export function isValidSelector(selector = ''): selector is string {
  return validateFilterRE.test(selector)
}

// 可选实现：export const splitCode = (code: string) => [...new Set(code.split(/\\?[\s'"`;={}]+/g))].filter(isValidSelector)

/** 候选 token 分割结果缓存，避免对相同字符串重复分割和过滤。 */
const splitCache = new Map<string, string[]>()
const SPLIT_CACHE_LIMIT = 8192

const ESCAPED_WHITESPACE_RE = /\\[nrt]/g

function isSplitter(char: string, bracketDepth: number) {
  return bracketDepth === 0 && (char === '"' || /\s/.test(char))
}

function hasClosingQuotedArbitraryValue(code: string, start: number, quote: string) {
  for (let index = start; index < code.length; index++) {
    if (code[index] === '\\') {
      index++
      continue
    }
    if (code[index] === quote) {
      return code.includes(']', index + 1)
    }
  }

  return false
}

function splitBracketAware(code: string) {
  const result: string[] = []
  let bracketDepth = 0
  let bracketQuote: string | undefined
  let start = 0

  for (let index = 0; index < code.length; index++) {
    const char = code[index]
    if (bracketDepth > 0 && char === '\\') {
      index++
      continue
    }

    if (bracketDepth > 0 && (char === '"' || char === '\'')) {
      if (bracketQuote === char) {
        bracketQuote = undefined
      }
      else if (bracketQuote === undefined && hasClosingQuotedArbitraryValue(code, index + 1, char)) {
        bracketQuote = char
      }
    }

    if (bracketQuote === undefined) {
      if (char === '[' && code.includes(']', index + 1)) {
        bracketDepth++
      }
      else if (char === ']' && bracketDepth > 0) {
        bracketDepth--
      }
    }

    if (!isSplitter(char, bracketDepth)) {
      continue
    }

    const candidate = code.slice(start, index)
    if (isValidSelector(candidate)) {
      result.push(candidate)
    }
    start = index + 1
  }

  const candidate = code.slice(start)
  if (isValidSelector(candidate)) {
    result.push(candidate)
  }

  return result
}

export function splitCandidateTokens(code: string) {
  const cached = splitCache.get(code)
  if (cached) {
    return cached
  }

  // 把压缩产物中的转义空白字符(\n \r \t)先还原成空格，避免被粘连到类名上
  const normalized = code.includes('\\') ? code.replace(ESCAPED_WHITESPACE_RE, ' ') : code

  const result = splitBracketAware(normalized)

  // 防止缓存无限增长
  if (splitCache.size >= SPLIT_CACHE_LIMIT) {
    splitCache.clear()
  }
  splitCache.set(code, result)

  return result
}

export function splitCode(code: string, _allowDoubleQuotes = false) {
  return splitCandidateTokens(code)
}
